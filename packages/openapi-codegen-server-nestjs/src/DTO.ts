import assert from 'assert';
import path from 'path';

import {
  addClassTransformerImports,
  addClassValidatorImports,
  addDecorator,
  startCase,
} from './utils';

import type { Generator } from './Generator';
import type { Logger } from './utils/logging';
import type { Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';
import type { ClassDeclaration, CodeBlockWriter, SourceFile } from 'ts-morph';

export class DTO {
  readonly generator: Generator;
  readonly className: string;
  readonly outputPath: string;
  private readonly schema: Nullable<SchemaModel>;
  private readonly tsSourceFile: SourceFile;
  private readonly logger: Logger;

  constructor(generator: Generator, name: string, schema: Nullable<SchemaModel>, logger: Logger) {
    this.generator = generator;
    this.className = name;
    this.outputPath = path.join(this.generator.outputPath, 'dto', `${this.className}.dto.ts`);
    this.schema = schema;
    this.tsSourceFile = this.generator.tsProject.createSourceFile(this.outputPath, '', {
      overwrite: true,
    });
    this.logger = logger;
  }

  generateCode(): void {
    this.logger.info(`Generating DTO ${this.outputPath}`);
    this.addClassDecl(this.className, this.schema);
  }

  protected addClassDecl(className: string, schema: Nullable<SchemaModel>): void {
    const classDecl = this.tsSourceFile.addClass({
      name: className,
      isExported: true,
    });

    if (schema) {
      assert(schema.type === 'object', `Schema type '${String(schema.type)}'`);

      for (const [propName, propSchema] of schema.properties) {
        switch (propSchema.type) {
          case null:
            this.addUnknownProperty(classDecl, propName, propSchema);
            break;
          case 'boolean':
            this.addBooleanProperty(classDecl, propName, propSchema);
            break;
          case 'number':
            this.addNumericProperty(classDecl, propName, propSchema);
            break;
          case 'string':
            this.addStringProperty(classDecl, propName, propSchema);
            break;
          case 'object':
            this.addObjectProperty(classDecl, propName, propSchema);
            break;
          case 'array':
            this.addArrayProperty(classDecl, propName, propSchema);
            break;
          default:
            assert.fail(`Unexpected schema type: ${String(propSchema.type)}`);
        }
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected addUnknownProperty(
    classDecl: ClassDeclaration,
    propName: string,
    propSchema: SchemaModel,
  ): void {
    const parentSchema = propSchema.parent as SchemaModel;
    const propDef = classDecl.addProperty({
      name: propName,
      type: 'unknown',
      hasQuestionToken: !parentSchema.required.has(propName),
    });
    propDef.prependWhitespace('\n');

    addClassTransformerImports(this.tsSourceFile, 'Expose');
    addDecorator(propDef, 'Expose', undefined);

    if (propSchema.allOf?.length || propSchema.oneOf?.length || propSchema.anyOf?.length) {
      addClassValidatorImports(this.tsSourceFile, 'ValidateNested');
      addDecorator(propDef, 'ValidateNested', undefined);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected addBooleanProperty(
    classDecl: ClassDeclaration,
    propName: string,
    propSchema: SchemaModel,
  ): void {
    const parentSchema = propSchema.parent as SchemaModel;
    const propDef = classDecl.addProperty({
      name: propName,
      type: 'boolean',
      hasQuestionToken: !parentSchema.required.has(propName),
    });
    propDef.prependWhitespace('\n');

    addClassTransformerImports(this.tsSourceFile, 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    addClassValidatorImports(this.tsSourceFile, 'IsBoolean');
    addDecorator(propDef, 'IsBoolean', undefined);
  }

  // eslint-disable-next-line class-methods-use-this
  protected addNumericProperty(
    classDecl: ClassDeclaration,
    propName: string,
    propSchema: SchemaModel,
  ): void {
    const parentSchema = propSchema.parent as SchemaModel;
    const propDef = classDecl.addProperty({
      name: propName,
      type: propSchema.nullable ? 'number | null' : 'number',
      hasQuestionToken: !parentSchema.required.has(propName),
    });
    propDef.prependWhitespace('\n');

    addClassTransformerImports(this.tsSourceFile, 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    if (propSchema.minimum != null) {
      addClassValidatorImports(this.tsSourceFile, 'Min');
      addDecorator(propDef, 'Min', propSchema.minimum);
    }
    if (propSchema.exclusiveMinimum != null) {
      addClassValidatorImports(this.tsSourceFile, 'Min');
      addDecorator(propDef, 'Min', propSchema.exclusiveMinimum);
    }
    if (propSchema.maximum != null) {
      addClassValidatorImports(this.tsSourceFile, 'Max');
      addDecorator(propDef, 'Max', propSchema.maximum);
    }
    if (propSchema.exclusiveMaximum != null) {
      addClassValidatorImports(this.tsSourceFile, 'Max');
      addDecorator(propDef, 'Max', propSchema.exclusiveMaximum);
    }
    addClassValidatorImports(this.tsSourceFile, 'IsInt');
    addDecorator(propDef, 'IsInt', undefined);
  }

  // eslint-disable-next-line class-methods-use-this
  protected addStringProperty(
    classDecl: ClassDeclaration,
    propName: string,
    propSchema: SchemaModel,
  ): void {
    const parentSchema = propSchema.parent as SchemaModel;
    const propDef = classDecl.addProperty({
      name: propName,
      type: propSchema.nullable ? 'string | null' : 'string',
      hasQuestionToken: !parentSchema.required.has(propName),
    });
    propDef.prependWhitespace('\n');

    addClassTransformerImports(this.tsSourceFile, 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    if (propSchema.minLength) {
      addClassValidatorImports(this.tsSourceFile, 'MinLength');
      addDecorator(propDef, 'MinLength', propSchema.minLength);
    }
    if (propSchema.maxLength) {
      addClassValidatorImports(this.tsSourceFile, 'MaxLength');
      addDecorator(propDef, 'MaxLength', propSchema.maxLength);
    }
    addClassValidatorImports(this.tsSourceFile, 'IsString');
    addDecorator(propDef, 'IsString', undefined);
  }

  // eslint-disable-next-line class-methods-use-this
  protected addObjectProperty(
    classDecl: ClassDeclaration,
    propName: string,
    propSchema: SchemaModel,
  ): void {
    const propClassName = startCase(`${classDecl.getName() ?? ''}-${propName}`).replace(/\s+/g, '');

    this.addClassDecl(propClassName, propSchema);

    const parentSchema = propSchema.parent as SchemaModel;
    const propDef = classDecl.addProperty({
      name: propName,
      type: propClassName,
      hasQuestionToken: !parentSchema.required?.has(propName),
    });
    propDef.prependWhitespace('\n');

    addClassTransformerImports(this.tsSourceFile, 'Expose', 'Type');
    addDecorator(propDef, 'Expose', undefined);
    addDecorator(propDef, 'Type', (writer: CodeBlockWriter) =>
      writer.write(`() => ${propClassName}`),
    );

    addDecorator(propDef, 'ValidateNested', undefined);
  }

  protected addArrayProperty(
    classDecl: ClassDeclaration,
    propName: string,
    propSchema: SchemaModel,
  ): void {
    assert(this.schema);

    let itemTypeString = 'unknown[]';
    switch (propSchema.items?.type) {
      case 'boolean':
        itemTypeString = 'boolean[]';
        break;
      case 'integer':
      case 'number':
        itemTypeString = 'number[]';
        break;
      case 'string':
        itemTypeString = 'string[]';
        break;
      case 'object':
        itemTypeString = 'object[]';
        break;
      case undefined:
      case null:
        break;
      default:
        assert.fail(`Unsupported schema type ${String(propSchema.items?.type)}`);
    }

    const propDef = classDecl.addProperty({
      name: propName,
      type: itemTypeString,
      hasQuestionToken: !this.schema.required.has(propName),
    });
    propDef.prependWhitespace('\n');

    addClassTransformerImports(this.tsSourceFile, 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    if (propSchema.minItems != null) {
      addClassValidatorImports(this.tsSourceFile, 'ArrayMinSize');
      addDecorator(propDef, 'ArrayMinSize', propSchema.minItems);
    }
    if (propSchema.maxItems != null) {
      addClassValidatorImports(this.tsSourceFile, 'ArrayMaxSize');
      addDecorator(propDef, 'ArrayMaxSize', propSchema.maxItems);
    }
    addClassValidatorImports(this.tsSourceFile, 'IsArray');
    addDecorator(propDef, 'IsArray', undefined);
  }
}

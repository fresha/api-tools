import assert from 'assert';
import path from 'path';

import {
  addDecorator,
  addImportDeclaration,
  Logger,
  titleCase,
} from '@fresha/openapi-codegen-utils';

import type { Generator } from './Generator';
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

    addImportDeclaration(this.tsSourceFile, 'class-transformer', 'Expose');
    addDecorator(propDef, 'Expose', undefined);

    if (propSchema.allOf?.length || propSchema.oneOf?.length || propSchema.anyOf?.length) {
      addImportDeclaration(this.tsSourceFile, 'class-validator', 'ValidateNested');
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

    addImportDeclaration(this.tsSourceFile, 'class-transformer', 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    addImportDeclaration(this.tsSourceFile, 'class-validator', 'IsBoolean');
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

    addImportDeclaration(this.tsSourceFile, 'class-transformer', 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    if (propSchema.minimum != null) {
      addImportDeclaration(this.tsSourceFile, 'class-validator', 'Min');
      addDecorator(propDef, 'Min', propSchema.minimum);
    }
    if (propSchema.exclusiveMinimum != null) {
      addImportDeclaration(this.tsSourceFile, 'class-validator', 'Min');
      addDecorator(propDef, 'Min', propSchema.exclusiveMinimum);
    }
    if (propSchema.maximum != null) {
      addImportDeclaration(this.tsSourceFile, 'class-validator', 'Max');
      addDecorator(propDef, 'Max', propSchema.maximum);
    }
    if (propSchema.exclusiveMaximum != null) {
      addImportDeclaration(this.tsSourceFile, 'class-validator', 'Max');
      addDecorator(propDef, 'Max', propSchema.exclusiveMaximum);
    }
    addImportDeclaration(this.tsSourceFile, 'class-validator', 'IsInt');
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

    addImportDeclaration(this.tsSourceFile, 'class-transformer', 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    if (propSchema.minLength) {
      addImportDeclaration(this.tsSourceFile, 'class-validator', 'MinLength');
      addDecorator(propDef, 'MinLength', propSchema.minLength);
    }
    if (propSchema.maxLength) {
      addImportDeclaration(this.tsSourceFile, 'class-validator', 'MaxLength');
      addDecorator(propDef, 'MaxLength', propSchema.maxLength);
    }
    addImportDeclaration(this.tsSourceFile, 'class-validator', 'IsString');
    addDecorator(propDef, 'IsString', undefined);
  }

  // eslint-disable-next-line class-methods-use-this
  protected addObjectProperty(
    classDecl: ClassDeclaration,
    propName: string,
    propSchema: SchemaModel,
  ): void {
    const propClassName = titleCase(`${classDecl.getName() ?? ''}-${propName}`).replace(/\s+/g, '');

    this.addClassDecl(propClassName, propSchema);

    const parentSchema = propSchema.parent as SchemaModel;
    const propDef = classDecl.addProperty({
      name: propName,
      type: propClassName,
      hasQuestionToken: !parentSchema.required?.has(propName),
    });
    propDef.prependWhitespace('\n');

    addImportDeclaration(this.tsSourceFile, 'class-transformer', 'Expose');
    addImportDeclaration(this.tsSourceFile, 'class-transformer', 'Type');
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

    addImportDeclaration(this.tsSourceFile, 'class-transformer', 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    if (propSchema.minItems != null) {
      addImportDeclaration(this.tsSourceFile, 'class-validator', 'ArrayMinSize');
      addDecorator(propDef, 'ArrayMinSize', propSchema.minItems);
    }
    if (propSchema.maxItems != null) {
      addImportDeclaration(this.tsSourceFile, 'class-validator', 'ArrayMaxSize');
      addDecorator(propDef, 'ArrayMaxSize', propSchema.maxItems);
    }
    addImportDeclaration(this.tsSourceFile, 'class-validator', 'IsArray');
    addDecorator(propDef, 'IsArray', undefined);
  }
}

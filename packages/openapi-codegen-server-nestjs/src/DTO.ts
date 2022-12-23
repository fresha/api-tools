import assert from 'assert';
import path from 'path';

import { Nullable, titleCase } from '@fresha/api-tools-core';
import { addDecorator, addImportDeclaration } from '@fresha/code-morph-ts';

import type { Context } from './context';
import type { SchemaModel, SchemaPropertyObject } from '@fresha/openapi-model/build/3.0.3';
import type { ClassDeclaration, CodeBlockWriter, SourceFile } from 'ts-morph';

export class DTO {
  readonly context: Context;
  readonly className: string;
  readonly outputPath: string;
  private readonly schema: Nullable<SchemaModel>;
  private readonly sourceFile: SourceFile;

  constructor(context: Context, name: string, schema: Nullable<SchemaModel>) {
    this.context = context;
    this.className = name;
    this.outputPath = path.join(this.context.outputPath, 'dto', `${this.className}.dto.ts`);
    this.schema = schema;
    this.sourceFile = this.context.project.createSourceFile(this.outputPath, '', {
      overwrite: true,
    });
  }

  generateCode(): void {
    this.context.logger.info(`Generating DTO ${this.outputPath}`);
    this.addClassDecl(this.className, this.schema);
  }

  protected addClassDecl(className: string, schema: Nullable<SchemaModel>): void {
    const classDecl = this.sourceFile.addClass({
      name: className,
      isExported: true,
    });

    if (schema) {
      assert(schema.type === 'object', `Schema type '${String(schema.type)}'`);

      for (const prop of schema.getProperties()) {
        switch (prop.schema.type) {
          case null:
            this.addUnknownProperty(classDecl, prop);
            break;
          case 'boolean':
            this.addBooleanProperty(classDecl, prop);
            break;
          case 'number':
            this.addNumericProperty(classDecl, prop);
            break;
          case 'string':
            this.addStringProperty(classDecl, prop);
            break;
          case 'object':
            this.addObjectProperty(classDecl, prop);
            break;
          case 'array':
            this.addArrayProperty(classDecl, prop);
            break;
          default:
            assert.fail(`Unexpected schema type: ${String(prop.schema.type)}`);
        }
      }
    }
  }

  protected addUnknownProperty(classDecl: ClassDeclaration, prop: SchemaPropertyObject): void {
    const propDef = classDecl.addProperty({
      name: prop.name,
      type: 'unknown',
      hasQuestionToken: !prop.required,
    });
    propDef.prependWhitespace('\n');

    addImportDeclaration(this.sourceFile, 'class-transformer', 'Expose');
    addDecorator(propDef, 'Expose', undefined);

    if (prop.schema.allOf?.length || prop.schema.oneOf?.length || prop.schema.anyOf?.length) {
      addImportDeclaration(this.sourceFile, 'class-validator', 'ValidateNested');
      addDecorator(propDef, 'ValidateNested', undefined);
    }
  }

  protected addBooleanProperty(classDecl: ClassDeclaration, prop: SchemaPropertyObject): void {
    const propDef = classDecl.addProperty({
      name: prop.name,
      type: 'boolean',
      hasQuestionToken: !prop.required,
    });
    propDef.prependWhitespace('\n');

    addImportDeclaration(this.sourceFile, 'class-transformer', 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    addImportDeclaration(this.sourceFile, 'class-validator', 'IsBoolean');
    addDecorator(propDef, 'IsBoolean', undefined);
  }

  protected addNumericProperty(classDecl: ClassDeclaration, prop: SchemaPropertyObject): void {
    const propDef = classDecl.addProperty({
      name: prop.name,
      type: prop.schema.nullable ? 'number | null' : 'number',
      hasQuestionToken: !prop.required,
    });
    propDef.prependWhitespace('\n');

    addImportDeclaration(this.sourceFile, 'class-transformer', 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    if (prop.schema.minimum != null) {
      addImportDeclaration(this.sourceFile, 'class-validator', 'Min');
      addDecorator(propDef, 'Min', prop.schema.minimum);
    }
    if (prop.schema.exclusiveMinimum != null) {
      addImportDeclaration(this.sourceFile, 'class-validator', 'Min');
      addDecorator(propDef, 'Min', prop.schema.exclusiveMinimum);
    }
    if (prop.schema.maximum != null) {
      addImportDeclaration(this.sourceFile, 'class-validator', 'Max');
      addDecorator(propDef, 'Max', prop.schema.maximum);
    }
    if (prop.schema.exclusiveMaximum != null) {
      addImportDeclaration(this.sourceFile, 'class-validator', 'Max');
      addDecorator(propDef, 'Max', prop.schema.exclusiveMaximum);
    }
    addImportDeclaration(this.sourceFile, 'class-validator', 'IsInt');
    addDecorator(propDef, 'IsInt', undefined);
  }

  protected addStringProperty(classDecl: ClassDeclaration, prop: SchemaPropertyObject): void {
    const propDef = classDecl.addProperty({
      name: prop.name,
      type: prop.schema.nullable ? 'string | null' : 'string',
      hasQuestionToken: !prop.required,
    });
    propDef.prependWhitespace('\n');

    addImportDeclaration(this.sourceFile, 'class-transformer', 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    if (prop.schema.minLength) {
      addImportDeclaration(this.sourceFile, 'class-validator', 'MinLength');
      addDecorator(propDef, 'MinLength', prop.schema.minLength);
    }
    if (prop.schema.maxLength) {
      addImportDeclaration(this.sourceFile, 'class-validator', 'MaxLength');
      addDecorator(propDef, 'MaxLength', prop.schema.maxLength);
    }
    addImportDeclaration(this.sourceFile, 'class-validator', 'IsString');
    addDecorator(propDef, 'IsString', undefined);
  }

  protected addObjectProperty(classDecl: ClassDeclaration, prop: SchemaPropertyObject): void {
    const propClassName = titleCase(`${classDecl.getName() ?? ''}-${prop.name}`).replace(
      /\s+/g,
      '',
    );

    this.addClassDecl(propClassName, prop.schema);

    const propDef = classDecl.addProperty({
      name: prop.name,
      type: propClassName,
      hasQuestionToken: !prop.required,
    });
    propDef.prependWhitespace('\n');

    addImportDeclaration(this.sourceFile, 'class-transformer', 'Expose');
    addImportDeclaration(this.sourceFile, 'class-transformer', 'Type');
    addDecorator(propDef, 'Expose', undefined);
    addDecorator(propDef, 'Type', (writer: CodeBlockWriter) =>
      writer.write(`() => ${propClassName}`),
    );

    addDecorator(propDef, 'ValidateNested', undefined);
  }

  protected addArrayProperty(classDecl: ClassDeclaration, prop: SchemaPropertyObject): void {
    assert(this.schema);

    let itemTypeString = 'unknown[]';
    switch (prop.schema.items?.type) {
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
        assert.fail(`Unsupported schema type ${String(prop.schema.items?.type)}`);
    }

    const propDef = classDecl.addProperty({
      name: prop.name,
      type: itemTypeString,
      hasQuestionToken: !prop.required,
    });
    propDef.prependWhitespace('\n');

    addImportDeclaration(this.sourceFile, 'class-transformer', 'Expose');
    addDecorator(propDef, 'Expose', undefined);
    if (prop.schema.minItems != null) {
      addImportDeclaration(this.sourceFile, 'class-validator', 'ArrayMinSize');
      addDecorator(propDef, 'ArrayMinSize', prop.schema.minItems);
    }
    if (prop.schema.maxItems != null) {
      addImportDeclaration(this.sourceFile, 'class-validator', 'ArrayMaxSize');
      addDecorator(propDef, 'ArrayMaxSize', prop.schema.maxItems);
    }
    addImportDeclaration(this.sourceFile, 'class-validator', 'IsArray');
    addDecorator(propDef, 'IsArray', undefined);
  }
}

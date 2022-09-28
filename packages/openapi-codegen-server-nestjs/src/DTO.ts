import assert from 'assert';
import path from 'path';

import { addClassValidatorImports, addDecorator } from './utils';

import type { Generator } from './Generator';
import type { Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';
import type { SourceFile } from 'ts-morph';

export class DTO {
  readonly generator: Generator;
  readonly className: string;
  readonly outputPath: string;
  private readonly schema: Nullable<SchemaModel>;
  private readonly tsSourceFile: SourceFile;

  constructor(generator: Generator, name: string, schema: Nullable<SchemaModel>) {
    this.generator = generator;
    this.className = name;
    this.outputPath = path.join(this.generator.outputPath, 'dto', `${this.className}.dto.ts`);
    this.schema = schema;
    this.tsSourceFile = this.generator.tsProject.createSourceFile(this.outputPath, '', {
      overwrite: true,
    });
  }

  generateCode(): void {
    const classDecl = this.tsSourceFile.addClass({
      name: this.className,
      isExported: true,
    });

    if (this.schema) {
      assert(this.schema.type === 'object');

      for (const [propName, propSchema] of this.schema.properties) {
        switch (propSchema.type) {
          case null: {
            const propDef = classDecl.addProperty({
              name: propName,
              type: 'unknown',
              hasQuestionToken: !this.schema.required.has(propName),
            });
            if (propSchema.allOf?.length || propSchema.oneOf?.length || propSchema.anyOf?.length) {
              addClassValidatorImports(this.tsSourceFile, 'ValidateNested');
              addDecorator(propDef, 'ValidateNested', undefined);
            }
            break;
          }
          case 'boolean': {
            const propDef = classDecl.addProperty({
              name: propName,
              type: 'boolean',
              hasQuestionToken: !this.schema.required.has(propName),
            });
            addClassValidatorImports(this.tsSourceFile, 'IsBoolean');
            addDecorator(propDef, 'IsBoolean', undefined);
            break;
          }
          case 'number': {
            const propDef = classDecl.addProperty({
              name: propName,
              type: propSchema.nullable ? 'number | null' : 'number',
              hasQuestionToken: !this.schema.required.has(propName),
            });
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
            break;
          }
          case 'string': {
            const propDef = classDecl.addProperty({
              name: propName,
              type: propSchema.nullable ? 'string | null' : 'string',
              hasQuestionToken: !this.schema.required.has(propName),
            });
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
            break;
          }
          case 'object': {
            const propDef = classDecl.addProperty({
              name: propName,
              type: 'object',
              hasQuestionToken: !this.schema.required.has(propName),
            });
            addDecorator(propDef, 'ValidateNested', undefined);
            break;
          }
          case 'array': {
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
            break;
          }
          default:
            assert.fail(`Unexpected schema type: ${String(propSchema.type)}`);
        }
      }
    }
  }
}

import assert from 'assert';

import { faker } from '@faker-js/faker';
import { JSONValue, snakeCase } from '@fresha/api-tools-core';
import { getNumericSchemaRange } from '@fresha/openapi-codegen-utils';

import type { Context } from '../context';
import type { SourceFile } from '@fresha/code-morph-ex';
import type { JSONAPIResourceSchema } from '@fresha/json-api-model';

export class ResourceTestSuite {
  protected readonly context: Context;
  readonly moduleName: string;
  protected readonly resourceModuleName: string;
  protected readonly resourceModuleAlias: string;
  protected readonly resource: JSONAPIResourceSchema;
  readonly sourceFile: SourceFile;

  constructor(
    context: Context,
    moduleName: string,
    resourceModuleName: string,
    resource: JSONAPIResourceSchema,
  ) {
    this.context = context;
    this.moduleName = moduleName;
    this.resourceModuleName = resourceModuleName;
    this.resource = resource;
    this.resourceModuleAlias = this.context.project.getResourceModuleAlias(this.resource.type);
    this.sourceFile = this.context.project.createResourceTestFile(this.moduleName);
  }

  collectData(): void {
    this.context.logger.info(`Generating code for resource`);
  }

  generateCode(): void {
    this.context.logger.info(`Generating code for resource`);

    this.sourceFile.writeDefmodule(this.moduleName, () => {
      this.sourceFile.writeUse('ExUnit.Case', 'async: false');
      if (this.resource.schema) {
        this.sourceFile.writeImport(this.context.testObjectFactoryModuleName);
      }
      this.sourceFile.writeAlias(this.resourceModuleName);

      if (this.resource.schema) {
        this.generateTestBuildFunction();
      }
      this.generateTestLinkFunction();
    });
  }

  protected generateTestData(): Map<string, JSONValue> {
    faker.seed(132489235);

    const resourceSchema = this.resource.schema;
    assert(resourceSchema);

    const result = new Map<string, JSONValue>();

    result.set('id', faker.datatype.number({ min: 1, max: 1000 }));

    const attributesSchema = resourceSchema.getPropertyDeepOrThrow('attributes');
    for (const [attrName, attrSchema] of attributesSchema.properties()) {
      switch (attrSchema.type) {
        case 'boolean':
          result.set(attrName, faker.datatype.boolean());
          break;
        case 'integer':
          result.set(attrName, faker.datatype.number(getNumericSchemaRange(attrSchema)));
          break;
        case 'number': {
          const precision = 0.01;
          result.set(
            attrName,
            faker.datatype.number({ precision, ...getNumericSchemaRange(attrSchema, precision) }),
          );
          break;
        }
        case 'string': {
          switch (attrSchema.format) {
            case 'password':
              result.set(attrName, faker.internet.password(8));
              break;
            case 'date': {
              const now = Date.now();
              const tenDays = 10 * 86400 * 1000;
              const date = faker.date.between(now - tenDays, now + tenDays);
              result.set(attrName, `"${date.toISOString().replace(/T.*$/g, '')}"`);
              break;
            }
            case 'date-time': {
              const now = Date.now();
              const tenDays = 10 * 86400 * 1000;
              const date = faker.date.between(now - tenDays, now + tenDays);
              result.set(attrName, `"${date.toISOString()}"`);
              break;
            }
            default: {
              const min = attrSchema.minLength ?? 0;
              const max = attrSchema.maxLength ?? 1024;
              result.set(attrName, `"${faker.lorem.word({ length: { min, max } })}"`);
              break;
            }
          }
          break;
        }
        default:
          assert.fail(
            `Unexpected schema type "${String(attrSchema.type)}" for attribute "${attrName}"`,
          );
      }
    }

    const relationshipsSchema = resourceSchema.getPropertyDeepOrThrow('relationships');
    for (const [relName] of relationshipsSchema.properties()) {
      const key = `${relName}Id`;
      result.set(key, faker.datatype.number({ min: 1, max: 1000 }));
    }

    return result;
  }

  protected generateTestBuildFunction(): void {
    const resourceSchema = this.resource.schema;
    assert(resourceSchema);

    this.sourceFile.newLine();
    this.sourceFile.writeLine('test "build/1" do');
    this.sourceFile.writeIndented(() => {
      // prepare part
      const values = this.generateTestData();

      this.sourceFile.writeLine('config = build(');
      this.sourceFile.writeIndented(() => {
        this.sourceFile.writeLine(`:${snakeCase(this.resource.type)},`);
        this.sourceFile.writeLine(`id: ${String(values.get('id'))},`);

        for (const attrName of this.resource.getAttributeNames()) {
          const attrValue = values.get(attrName);
          const elixirAttrName = snakeCase(attrName);
          this.sourceFile.writeLine(`${elixirAttrName}: ${String(attrValue)},`);
        }
        for (const relObj of this.resource.relationshipSchemas()) {
          const relValue = String(!!relObj.schema);
          const elixirRelName = snakeCase(`${relObj.name}Id`);
          this.sourceFile.writeLine(`${elixirRelName}: ${String(relValue)},`);
        }
      });
      this.sourceFile.writeLine(')');
      this.sourceFile.newLine();

      // assert part
      this.sourceFile.writeLine(
        `assert ${this.resourceModuleAlias}.build(config) == %Jabbax.Document.Resource{`,
      );
      this.sourceFile.writeIndented(() => {
        this.sourceFile.writeLine(`type: "${this.resource.type}",`);
        this.sourceFile.writeLine(`id: ${String(values.get('id'))},`);

        if (this.resource.hasAttributes()) {
          this.sourceFile.writeLine('attributes: %{');
          this.sourceFile.writeIndented(() => {
            for (const attrName of this.resource.getAttributeNames()) {
              const elixirAttrName = snakeCase(attrName);
              this.sourceFile.writeLine(`${elixirAttrName}: ${String(values.get(attrName))},`);
            }
          });
          this.sourceFile.writeLine('},');
        } else {
          this.sourceFile.writeLine('attributes: %{},');
        }

        if (this.resource.hasRelationships()) {
          this.sourceFile.writeLine('relationships: %{');
          this.sourceFile.writeIndented(() => {
            for (const relObj of this.resource.relationshipSchemas()) {
              const elixirAttrName = snakeCase(relObj.name);
              this.sourceFile.writeLine(
                `${elixirAttrName}: %Jabbax.Document.ResourceId{id: config.${elixirAttrName}.id, type: "${relObj.resourceType}"},`,
              );
            }
          });
          this.sourceFile.writeLine('},');
        } else {
          this.sourceFile.writeLine('relationships: %{},');
        }
      });
      this.sourceFile.writeLine('}');
    });
    this.sourceFile.writeLine('end');
  }

  protected generateTestLinkFunction(): void {
    this.sourceFile.newLine();
    this.sourceFile.writeLine('test "link/1" do');
    this.sourceFile.writeIndented(() => {
      const value = 3525;
      this.sourceFile.writeLine(
        `assert ${this.resourceModuleAlias}.link(%{ id: ${value} }) == %Jabbax.Document.ResourceId{`,
      );
      this.sourceFile.writeIndentedLines(`type: "${this.resource.type}",`, `id: ${value},`);
      this.sourceFile.writeLine('}');
    });
    this.sourceFile.writeLine('end');
  }
}

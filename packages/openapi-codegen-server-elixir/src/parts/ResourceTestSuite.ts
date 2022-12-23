import assert from 'assert';

import { faker } from '@faker-js/faker';
import { JSONValue, snakeCase } from '@fresha/api-tools-core';

import type { Context } from './types';
import type { SourceFile } from '@fresha/code-morph-ex';
import type { ResourceModel } from '@fresha/json-api-model';

export class ResourceTestSuite {
  protected readonly context: Context;
  readonly moduleName: string;
  protected readonly resourceModuleName: string;
  protected readonly resourceModuleAlias: string;
  protected readonly resource: ResourceModel;
  protected readonly sourceFile: SourceFile;

  constructor(
    context: Context,
    moduleName: string,
    resourceModuleName: string,
    resource: ResourceModel,
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
      if (this.resource.jsonSchema()) {
        this.sourceFile.writeImport(this.context.testObjectFactoryModuleName);
      }
      this.sourceFile.writeAlias(this.resourceModuleName);

      if (this.resource.jsonSchema()) {
        this.generateTestBuildFunction();
      }
      this.generateTestLinkFunction();
    });
  }

  protected generateTestData(): Map<string, JSONValue> {
    faker.seed(132489235);

    const resourceSchema = this.resource.jsonSchema();
    assert(resourceSchema);

    const result = new Map<string, JSONValue>();

    result.set('id', faker.datatype.number({ min: 1, max: 1000 }));

    const attributesSchema = resourceSchema.getPropertyOrThrow('attributes');
    for (const [attrName, attrSchema] of attributesSchema.properties) {
      switch (attrSchema.type) {
        case 'boolean':
          result.set(attrName, faker.datatype.boolean());
          break;
        case 'integer': {
          let min: number | undefined;
          if (attrSchema.minimum != null) {
            min = attrSchema.minimum;
          } else if (attrSchema.exclusiveMinimum != null) {
            min = attrSchema.exclusiveMinimum + 1;
          }
          let max: number | undefined;
          if (attrSchema.maximum != null) {
            max = attrSchema.maximum;
          } else if (attrSchema.exclusiveMaximum != null) {
            max = attrSchema.exclusiveMaximum - 1;
          }
          result.set(attrName, faker.datatype.number({ min, max }));
          break;
        }
        case 'number': {
          let min: number | undefined;
          if (attrSchema.minimum != null) {
            min = attrSchema.minimum;
          } else if (attrSchema.exclusiveMinimum != null) {
            min = attrSchema.exclusiveMinimum + 1;
          }
          let max: number | undefined;
          if (attrSchema.maximum != null) {
            max = attrSchema.maximum;
          } else if (attrSchema.exclusiveMaximum != null) {
            max = attrSchema.exclusiveMaximum - 1;
          }
          result.set(attrName, faker.datatype.number({ min, max, precision: 0.01 }));
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

    const relationshipsSchema = resourceSchema.getPropertyOrThrow('relationships');
    for (const [relName] of relationshipsSchema.properties) {
      const key = `${relName}Id`;
      result.set(key, faker.datatype.number({ min: 1, max: 1000 }));
    }

    return result;
  }

  protected generateTestBuildFunction(): void {
    const resourceSchema = this.resource.jsonSchema();
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

        for (const attrName of this.resource.attributes.keys()) {
          const attrValue = values.get(attrName);
          const elixirAttrName = snakeCase(attrName);
          this.sourceFile.writeLine(`${elixirAttrName}: ${String(attrValue)},`);
        }
        for (const [relName, relObj] of this.resource.relationships) {
          const relValue = String(!!relObj.jsonSchema());
          const elixirRelName = snakeCase(`${relName}Id`);
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

        if (this.resource.attributes.size) {
          this.sourceFile.writeLine('attributes: %{');
          this.sourceFile.writeIndented(() => {
            for (const attrName of this.resource.attributes.keys()) {
              const elixirAttrName = snakeCase(attrName);
              this.sourceFile.writeLine(`${elixirAttrName}: ${String(values.get(attrName))},`);
            }
          });
          this.sourceFile.writeLine('},');
        } else {
          this.sourceFile.writeLine('attributes: %{},');
        }

        if (this.resource.relationships.size) {
          this.sourceFile.writeLine('relationships: %{');
          this.sourceFile.writeIndented(() => {
            for (const [relName, { otherResourceType }] of this.resource.relationships) {
              const elixirAttrName = snakeCase(relName);
              this.sourceFile.writeLine(
                `${elixirAttrName}: %Jabbax.Document.ResourceId{id: config.${elixirAttrName}.id, type: "${otherResourceType}"},`,
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

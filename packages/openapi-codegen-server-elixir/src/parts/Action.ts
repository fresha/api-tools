import assert from 'assert';

import { Nullable, snakeCase } from '@fresha/api-tools-core';
import { getOperationRequestBodySchema } from '@fresha/openapi-codegen-utils';

import type { Context } from '../context';
import type { SourceFile } from '@fresha/code-morph-ex';
import type {
  OperationModel,
  PathItemOperationKey,
  SchemaModel,
} from '@fresha/openapi-model/build/3.0.3';

/**
 * Generates action function, as well as (if needed) private helper functions for
 * parsing action parameters and request body document.
 */
export class Action {
  protected readonly context: Context;
  protected readonly sourceFile: SourceFile;
  protected readonly name: string;
  protected readonly operationKey: PathItemOperationKey;
  protected readonly operation: OperationModel;
  protected readonly usesParams: boolean;
  protected readonly requestBodySchema: Nullable<SchemaModel>;
  needsDateTimeParser: boolean;

  constructor(
    context: Context,
    sourceFile: SourceFile,
    name: string,
    operationKey: PathItemOperationKey,
    operation: OperationModel,
  ) {
    this.context = context;
    this.sourceFile = sourceFile;
    this.name = name;
    this.operationKey = operationKey;
    this.operation = operation;
    this.usesParams = !!this.operation.parameters.length;
    this.requestBodySchema = getOperationRequestBodySchema(this.operation, this.context.useJsonApi);
    this.needsDateTimeParser = false;
  }

  getName(): string {
    return this.name;
  }

  generateCode(): void {
    this.context.logger.info('Generating code');

    this.generateActionFunction();
    if (this.usesParams) {
      this.generateParseParamsFunction();
    }
    if (this.requestBodySchema) {
      this.generateParseConnFunction();
    }
  }

  protected generateActionFunction(): void {
    this.sourceFile.writeFunction({
      name: this.name,
      params: ['conn', this.usesParams ? 'params' : '_params'],
      content: () => {
        const withClauses = [] as string[];
        if (this.usesParams) {
          const paramNames = this.operation.parameters.map(p => snakeCase(p.name));
          withClauses.push(`{:ok, ${paramNames.join(', ')}} <- parse_${this.name}_params(params)`);
        }
        if (this.requestBodySchema) {
          withClauses.push(`{:ok, parsed_opts} <- parse_${this.name}_conn(conn)`);
        }

        if (withClauses.length) {
          this.sourceFile.writeWith(
            withClauses,
            () => this.generateActionFunctionCore(),
            () => {
              const mappings: Record<string, string> = {};

              // :invalid_pointers and :invalid_parameters if needed when we use
              // Surgex.parse/2 or Surgex.flat_parse/2
              if (this.usesParams || this.requestBodySchema) {
                Object.assign(mappings, {
                  '{:error, :invalid_parameters, params}': '{:error, :invalid_parameters, params}',
                  '{:error, :invalid_pointers, pointers}':
                    '{:error, :invalid_parameters, pointers}',
                });
              }

              // handle :not_found for actions accepting "resource id"
              if (['index', 'show', 'update'].includes(this.name)) {
                Object.assign(mappings, {
                  '{:error, :not_found}': '{:error, :not_found}',
                });
              }

              this.sourceFile.writeMappings(mappings);
            },
          );
        } else {
          this.generateActionFunctionCore();
        }
      },
    });
  }

  protected generateActionFunctionCore(): void {
    this.sourceFile.writeLine('# TODO this is the part you need to implement by yourself');
    this.sourceFile.writeLine('# TODO evaluate extra arguments, then pass them to render()');
    this.sourceFile.writeLine('render(conn)');
  }

  protected generateParseParamsFunction(): void {
    this.sourceFile.writeFunction({
      isPrivate: true,
      name: `parse_${this.name}_params`,
      params: ['params'],
      content: () => {
        const params = ['params'];

        for (const param of this.operation.parameters) {
          const name = snakeCase(param.name);

          const parsers: string[] = [];
          switch (param.schema?.type) {
            case undefined:
            case null:
              parsers.push(':string');
              break;
            case 'boolean':
              parsers.push(':boolean');
              break;
            case 'integer':
              parsers.push(':integer');
              break;
            case 'number':
              parsers.push(':float');
              break;
            case 'string': {
              if (param.name === 'id') {
                parsers.push(':id');
              } else {
                switch (param.schema.format) {
                  case 'date':
                    parsers.push(':date');
                    break;
                  case 'date-time':
                    parsers.push('&naive_date_time/1');
                    this.needsDateTimeParser = true;
                    break;
                  case null:
                    parsers.push(':string');
                    break;
                  default:
                    assert.fail(
                      `Unexpected schema format for type ${String(
                        param.schema.format,
                      )}, parameter ${param.name} from ${String(param.in)}`,
                    );
                }
              }
              break;
            }
            case 'array': {
              assert(
                !Array.isArray(param.schema.items),
                `Unsupported tuple type "${String(param.schema?.type)}" for parameter "${
                  param.name
                }" from "${String(param.in)}"`,
              );
              const itemSchemaType = param.schema.items?.type;
              if (
                itemSchemaType === 'string' ||
                itemSchemaType === 'number' ||
                itemSchemaType === 'integer'
              ) {
                parsers.push(':id_list');
              } else {
                assert.fail(
                  `Unsupported type "${String(param.schema?.type)}" for parameter "${
                    param.name
                  }" from "${String(param.in)}"`,
                );
              }
              break;
            }
            default:
              assert.fail(
                `Unsupported type "${String(param.schema?.type)}" for parameter "${
                  param.name
                }" from "${String(param.in)}"`,
              );
          }

          if (param.required) {
            parsers.push(':required');
          }

          params.push(`${name}: ${parsers.length > 1 ? `[${parsers.join(', ')}]` : parsers[0]}`);
        }

        this.sourceFile.writeFunctionCall('flat_parse', ...params);
      },
    });
  }

  protected generateParseConnFunction(): void {
    assert(this.context.useJsonApi, 'Expect to use JSON:API mode');

    const { requestBodySchema } = this;
    assert(
      requestBodySchema,
      'You do not need to generate parse_conn function if the request body is not set',
    );
    const resourceSchema = requestBodySchema.getPropertyOrThrow('data');

    this.sourceFile.writeFunction({
      name: `parse_${this.name}_conn`,
      isPrivate: true,
      params: ['conn'],
      content: () => {
        this.sourceFile.writeLine('parse(');
        this.sourceFile.writeIndented(() => {
          this.sourceFile.writeLine('conn.assigns[:doc],');
          this.sourceFile.writeLine('id: [:id, :required],');
          this.sourceFile.writeLine('attributes: %{');
          this.sourceFile.writeIndented(() => {
            const attributesSchema = resourceSchema.getPropertyDeepOrThrow('attributes');
            for (const [attrName, attrSchema] of attributesSchema.properties) {
              switch (attrSchema.type) {
                case 'boolean': {
                  this.generateBooleanSurgexParsers(attributesSchema, attrName);
                  break;
                }
                case 'integer': {
                  this.generateIntegerSurgexParsers(attributesSchema, attrName, attrSchema);
                  break;
                }
                case 'number': {
                  this.generateFloatSurgexParsers(attributesSchema, attrName, attrSchema);
                  break;
                }
                case 'string': {
                  this.generateStringSurgexParsers(attributesSchema, attrName, attrSchema);
                  break;
                }
                default:
                  assert.fail(`Unexpected schema type ${String(attrSchema.type)}`);
              }
            }
          });
          this.sourceFile.writeLine('},');
          this.sourceFile.writeLine('relationships: %{');
          this.sourceFile.writeIndented(() => {
            const relationshipsSchema = resourceSchema.getPropertyDeepOrThrow('relationships');

            for (const [relName] of relationshipsSchema.properties) {
              const elixirAtttName = snakeCase(relName);
              const relParser = relationshipsSchema.required.has(relName)
                ? '[:resource_id, :required],'
                : ':resource_id,';
              this.sourceFile.writeLine(`${elixirAtttName}: ${relParser}`);
            }
          });
          this.sourceFile.writeLine('},');
        });
        this.sourceFile.writeLine(')');
      },
    });
  }

  protected generateBooleanSurgexParsers(parentSchema: SchemaModel, propName: string): void {
    const elixirAtttName = snakeCase(propName);
    const parsers = [':boolean'];
    if (parentSchema.required.has(propName)) {
      parsers.push(':required');
    }
    const parsersStr = parsers.length > 1 ? `[${parsers.join(', ')}]` : parsers[0];
    this.sourceFile.writeLine(`${elixirAtttName}: ${parsersStr},`);
  }

  protected generateIntegerSurgexParsers(
    parentSchema: SchemaModel,
    propName: string,
    propSchema: SchemaModel,
  ): void {
    const elixirAtttName = snakeCase(propName);
    const parsers: string[] = [];

    let minimum: Nullable<number> = null;
    if (propSchema.minimum != null) {
      minimum = propSchema.exclusiveMinimum ? propSchema.minimum + 1 : propSchema.minimum;
    }

    let maximum: Nullable<number> = null;
    if (propSchema.maximum != null) {
      maximum = propSchema.exclusiveMaximum ? propSchema.maximum - 1 : propSchema.maximum;
    }

    if (minimum == null || maximum == null) {
      parsers.push(':integer');
    } else {
      const parts = ['{:integer'];
      if (minimum != null) {
        parts.push(`min: ${minimum}`);
      }
      if (maximum != null) {
        parts.push(`max: ${maximum}`);
      }
      parsers.push(`${parts.join(', ')}}`);
    }

    if (parentSchema.required.has(propName)) {
      parsers.push(':required');
    }

    const parsersStr = parsers.length > 1 ? `[${parsers.join(', ')}]` : parsers[0];
    this.sourceFile.writeLine(`${elixirAtttName}: ${parsersStr},`);
  }

  protected generateFloatSurgexParsers(
    parentSchema: SchemaModel,
    propName: string,
    propSchema: SchemaModel,
  ): void {
    const elixirAtttName = snakeCase(propName);
    const parsers: string[] = [];

    // Surgex.Parsers doesn't have a way to distinguish between >min and >=min
    let minimum: Nullable<number> = null;
    if (propSchema.minimum != null) {
      minimum = propSchema.exclusiveMinimum ? propSchema.minimum - 1 : propSchema.minimum;
    }
    let maximum: Nullable<number> = null;
    if (propSchema.maximum != null) {
      maximum = propSchema.exclusiveMaximum ? propSchema.maximum + 1 : propSchema.maximum;
    }

    // Surgex.Parsers doesn't distinguish between float and double
    if (minimum == null || maximum == null) {
      parsers.push(':float');
    } else {
      const parts = ['{:float'];
      if (minimum != null) {
        parts.push(`min: ${minimum}`);
      }
      if (maximum != null) {
        parts.push(`max: ${maximum}`);
      }
      parsers.push(`${parts.join(', ')}}`);
    }

    if (parentSchema.required.has(propName)) {
      parsers.push(':required');
    }

    const parsersStr = parsers.length > 1 ? `[${parsers.join(', ')}]` : parsers[0];
    this.sourceFile.writeLine(`${elixirAtttName}: ${parsersStr},`);
  }

  protected generateStringSurgexParsers(
    parentSchema: SchemaModel,
    propName: string,
    propSchema: SchemaModel,
  ): void {
    const elixirAtttName = snakeCase(propName);
    const parsers: string[] = [];

    let propType = ':string';
    switch (propSchema.format) {
      case null:
        break;
      case 'date':
        propType = ':date';
        break;
      case 'date-time':
        propType = '&naive_date_time/1';
        this.needsDateTimeParser = true;
        break;
      default:
        assert.fail(
          `Unsupported schema format "${String(propSchema.format)}" for property "${propName}"`,
        );
    }

    if (
      propType === ':string' &&
      (parentSchema.minLength != null || parentSchema.maxLength != null)
    ) {
      const parts = [`{:${propType}`];
      if (parentSchema.minLength != null) {
        parts.push(`min: ${parentSchema.minLength}`);
      }
      if (parentSchema.maxLength != null) {
        parts.push(`max: ${parentSchema.maxLength}`);
      }
      parsers.push(`${parts.join(', ')}}`);
    } else {
      parsers.push(propType);
    }

    if (parentSchema.required.has(propName)) {
      parsers.push(':required');
    }

    if (propSchema.enum?.length) {
      parsers.push(`{:contain, ~w{${propSchema.enum.join(' ')}}}`);
    }

    const parsersStr = parsers.length > 1 ? `[${parsers.join(', ')}]` : parsers[0];
    this.sourceFile.writeLine(`${elixirAtttName}: ${parsersStr},`);
  }
}

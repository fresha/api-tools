import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { Context, Generator as GeneratorBase, getMediaType } from '@fresha/openapi-codegen-utils';

import type { ParametrisedURLString } from '@fresha/api-tools-core/build/types';
import type { PathItemOperationKey, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

type ResourceUsage = {
  url: ParametrisedURLString;
  httpMethod: PathItemOperationKey;
  inRequest?: 'data' | 'include';
  inResponse?: 'data' | 'include';
};

const getResourceType = (name: string, schema: SchemaModel): string => {
  let typeSchema: SchemaModel | undefined;

  if (schema.allOf?.length) {
    typeSchema = schema.allOf?.find(item => item.getProperty('type'));
    if (typeSchema) {
      typeSchema = typeSchema.getProperty('type');
    }
  }
  if (!typeSchema) {
    typeSchema = schema.getProperty('type');
  }
  assert(typeSchema, `Cannot determine JSON:API resource type for schema name ${name}`);

  const result = typeSchema.enum?.at(0);
  assert(typeof result === 'string', `JSON:API resource type must be a string (name=${name})`);

  return result;
};

export class Generator extends GeneratorBase<Context> {
  readonly schemaToName: Map<SchemaModel, string>;
  readonly schemaToType: Map<SchemaModel, string>;
  readonly resourceUsage: Map<string, ResourceUsage[]>;

  constructor(context: Context) {
    super(context);
    this.schemaToName = new Map<SchemaModel, string>();
    this.schemaToType = new Map<SchemaModel, string>();
    this.resourceUsage = new Map<string, ResourceUsage[]>();
  }

  protected collectData(): void {
    for (const [name, schema] of this.context.openapi.components.schemas) {
      if (name.endsWith('Resource')) {
        const type = getResourceType(name, schema);
        this.schemaToName.set(schema, name);
        this.schemaToType.set(schema, type);
      }
    }

    const mediaType = getMediaType(true);

    for (const [pathUrl, pathItem] of this.context.openapi.paths) {
      for (const [httpMethod, operation] of pathItem.operations()) {
        // const requestBodySchema = operation.requestBody?.content.get(mediaType)?.schema;
        // if (requestBodySchema && requestBodySchema.type === 'object') {
        //   const primaryData = requestBodySchema.getPropertyOrThrow('data');
        //   if (schemaToName.has(primaryData)) {
        //   }

        //   // const included = requestBodySchema.getProperty('included');
        //   // if (included) {
        //   // }
        // }

        for (const response of operation.responses.codes.values()) {
          const responseDocumentSchema = response.content.get(mediaType)?.schema;

          let primaryDataSchema = responseDocumentSchema?.getProperty('data') ?? null;
          if (primaryDataSchema?.type === 'array') {
            primaryDataSchema = primaryDataSchema.items;
          }
          if (primaryDataSchema?.anyOf?.length) {
            for (const subschema of primaryDataSchema.anyOf) {
              this.addUsage(subschema, pathUrl, httpMethod, undefined, 'data');
            }
          } else if (primaryDataSchema) {
            this.addUsage(primaryDataSchema, pathUrl, httpMethod, undefined, 'data');
          }

          const includedSchema = responseDocumentSchema?.getProperty('included')?.items ?? null;
          const subschemas: SchemaModel[] = [];
          if (includedSchema?.anyOf?.length) {
            subschemas.push(...includedSchema.anyOf);
          }
          if (includedSchema?.oneOf?.length) {
            subschemas.push(...includedSchema.oneOf);
          }
          if (subschemas.length) {
            for (const subschema of subschemas) {
              this.addUsage(subschema, pathUrl, httpMethod, undefined, 'include');
            }
          } else if (includedSchema) {
            this.addUsage(includedSchema, pathUrl, httpMethod, undefined, 'include');
          }
        }
      }
    }
  }

  private addUsage(
    schema: SchemaModel,
    url: ParametrisedURLString,
    httpMethod: PathItemOperationKey,
    inRequest?: 'data' | 'include',
    inResponse?: 'data' | 'include',
  ): void {
    const resourceName = this.schemaToName.get(schema);
    if (!resourceName) {
      global.console.log(schema);
    }
    assert(resourceName, `Something is wrong at ${url}, ${httpMethod}, ${schema.title ?? ''}`);

    const entries = this.resourceUsage.get(resourceName);
    if (entries) {
      entries.push({ url, httpMethod, inRequest, inResponse });
    } else {
      this.resourceUsage.set(resourceName, [{ url, httpMethod, inRequest, inResponse }]);
    }
  }

  protected generateCode(): void {
    const outputPath = path.join(this.context.outputPath, 'resource-usage.html');

    const rows: string[] = [];
    for (const [resourceName, usages] of this.resourceUsage) {
      for (const usage of usages) {
        let inResponse = '';
        if (usage.inResponse === 'data') {
          inResponse = 'DATA';
        } else if (usage.inResponse === 'include') {
          inResponse = 'INCLUDE';
        }

        rows.push(`
          <tr>
            <td>${resourceName}</td>
            <td>${usage.httpMethod.toUpperCase()} ${usage.url}</td>
            <td>${usage.inRequest ? 'YES' : ''}</td>
            <td>${inResponse}</td>
          </tr>
        `);
      }
    }

    if (!this.context.dryRun) {
      const text = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              td, th {
                border: black 1px solid;
                padding: 4px 15px;
              }
            </style>
          </head>
          <body>
            <table>
              <caption>Resource usage in ${this.context.openapi.info.title}</caption>
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Operation</th>
                  <th>Request</th>
                  <th>Response</th>
                </tr>
              </thead>
              <tbody>
                ${rows.join('\n')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      fs.writeFileSync(outputPath, text, 'utf-8');
    }
  }
}

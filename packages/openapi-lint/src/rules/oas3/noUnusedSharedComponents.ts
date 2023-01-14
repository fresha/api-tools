import { OpenAPIModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';

export const id = 'no-unused-shared-components';

export const autoFixable = false;

const removeReferenceSchema = (schema: SchemaModel, sharedSchemas: Set<SchemaModel>): void => {
  for (const prop of schema.properties.values()) {
    removeReferenceSchema(prop, sharedSchemas);
  }
  if (schema.additionalProperties && schema.additionalProperties instanceof Object) {
    removeReferenceSchema(schema.additionalProperties, sharedSchemas);
  }
  if (schema.items) {
    removeReferenceSchema(schema.items, sharedSchemas);
  }
  if (schema.allOf?.length) {
    for (const alt of schema.allOf) {
      removeReferenceSchema(alt, sharedSchemas);
    }
  }
  if (schema.anyOf?.length) {
    for (const alt of schema.anyOf) {
      removeReferenceSchema(alt, sharedSchemas);
    }
  }
  if (schema.oneOf?.length) {
    for (const alt of schema.oneOf) {
      removeReferenceSchema(alt, sharedSchemas);
    }
  }

  sharedSchemas.delete(schema);
};

const findUnusedSharedSchemas = (openapi: OpenAPIModel): Set<SchemaModel> => {
  const sharedSchemas = new Set<SchemaModel>(openapi.components.schemas.values());

  for (const pathItem of openapi.paths.values()) {
    for (const param of pathItem.parameters) {
      if (param.schema) {
        removeReferenceSchema(param.schema, sharedSchemas);
      }
    }

    for (const [, operation] of pathItem.operations()) {
      for (const param of operation.parameters) {
        if (param.schema) {
          removeReferenceSchema(param.schema, sharedSchemas);
        }
      }

      if (operation.requestBody) {
        for (const content of operation.requestBody.content.values()) {
          if (content.schema) {
            removeReferenceSchema(content.schema, sharedSchemas);
          }
        }
      }
      if (operation.responses.default) {
        for (const content of operation.responses.default.content.values()) {
          if (content.schema) {
            removeReferenceSchema(content.schema, sharedSchemas);
          }
        }
      }
      for (const response of operation.responses.codes.values()) {
        for (const content of response.content.values()) {
          if (content.schema) {
            removeReferenceSchema(content.schema, sharedSchemas);
          }
        }
      }
    }
  }

  for (const sharedResponse of openapi.components.responses.values()) {
    for (const content of sharedResponse.content.values()) {
      if (content.schema) {
        removeReferenceSchema(content.schema, sharedSchemas);
      }
    }
  }

  return sharedSchemas;
};

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  const unusedSchemas = findUnusedSharedSchemas(openapi);
  for (const schema of unusedSchemas) {
    result.addWarning(`Shared schema ${schema.title ?? 'anonymous'} is unused`);
  }

  return false;
};
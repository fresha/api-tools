import { titleCase } from '@fresha/api-tools-core';

import type { JSONAPISchemaRegistry } from './types';
import type { OpenAPIModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export const jsonApiResourceSchemas = function* jsonApiResourceSchemas(
  openapi: OpenAPIModel,
): IterableIterator<[string, SchemaModel]> {
  for (const [, pathItem] of openapi.paths) {
    for (const [, operation] of pathItem.operations()) {
      if (operation.responses.default) {
        const responseSchema = operation.responses.default.getContent(
          'application/vnd.api+json',
        )?.schema;
        if (responseSchema) {
          yield [operation.operationId ?? '', responseSchema];
        }
      }
      for (const [, response] of operation.responses.codes) {
        const responseSchema = response.getContent('application/vnd.api+json')?.schema;
        if (responseSchema) {
          yield [operation.operationId ?? '', responseSchema];
        }
      }
    }
  }
};

export const parseOpenApi = (openapi: OpenAPIModel, registry: JSONAPISchemaRegistry): void => {
  for (const [operationId, schema] of jsonApiResourceSchemas(openapi)) {
    try {
      registry.addDocumentSchema(titleCase(`${operationId}Response`), schema);
    } catch (err) {
      // ignore, this is possibly because schemas are not JSON:API documents
    }
  }

  const missingResources = new Set<string>();
  for (const resType of registry.getResourceTypes()) {
    const resource = registry.getResourceSchemaOrThrow(resType);
    for (const relName of resource.getRelationshipNames()) {
      const relationship = resource.getRelationshipOrThrow(relName);
      if (!registry.getResourceSchema(relationship.resourceType)) {
        missingResources.add(relationship.resourceType);
      }
    }
  }

  for (const resourceType of missingResources) {
    registry.addResourceSchema(resourceType);
  }
};

import { titleCase } from '@fresha/api-tools-core';

import type { RegistryModel } from './types';
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

export const parseOpenApi = (openapi: OpenAPIModel, registry: RegistryModel) => {
  for (const [operationId, schema] of jsonApiResourceSchemas(openapi)) {
    try {
      registry.parseDocument(schema, titleCase(`${operationId}Response`));
    } catch (err) {
      // ignore, this is possibly because schemas are not JSON:API documents
    }
  }

  const missingResources = new Set<string>();
  for (const [, resource] of registry.resources) {
    for (const [, relationship] of resource.relationships) {
      if (!registry.resources.has(relationship.otherResourceType)) {
        missingResources.add(relationship.otherResourceType);
      }
    }
  }

  for (const resourceType of missingResources) {
    registry.createResource(resourceType);
  }
};

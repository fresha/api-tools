import assert from 'assert';

import { isJSONObject, JSONObject, Nullable } from '@fresha/api-tools-core';

import { assert as operationAssert } from './assert';
import { camelCase } from './string';

import type {
  OpenAPIModel,
  OperationModel,
  ParameterModel,
  SchemaModel,
} from '@fresha/openapi-model/build/3.0.3';

export const significantNameParts = (pathUrl: string): string[] =>
  pathUrl.split('/').filter(x => x && !(x.startsWith('{') && x.endsWith('}')));

export const getAPIName = (openapi: OpenAPIModel): string => {
  return openapi.info.title;
};

export const getRootUrl = (openapi: OpenAPIModel): string | undefined => {
  const result = openapi.paths.getExtension('root-url');
  assert(result === undefined || typeof result === 'string');
  return result;
};

export const getRootUrlOrThrow = (openapi: OpenAPIModel): string => {
  const result = getRootUrl(openapi);
  assert(result, `x-root-url extension is not specified in paths, using default API_URL`);
  return result;
};

export const getCodegenOptions = (
  operation: OperationModel,
  codegenName: string,
): JSONObject | undefined => {
  const ext = operation.getExtension('fresha-codegen');
  if (ext === undefined) {
    return undefined;
  }
  operationAssert(isJSONObject(ext), 'x-fresha-codegen must be a JSON object', operation);
  const result = ext[codegenName];
  if (result === undefined) {
    return undefined;
  }
  operationAssert(
    isJSONObject(result),
    'x-fresha-codegen for specific generator must be a JSON object',
    operation,
  );
  return result;
};

/**
 * Returns true if a given operation model is marked as internal.
 * As a marker, the `x-internal` specification extension is used.
 *
 * @param operation operation model
 */
export const isInternalOperation = (operation: OperationModel): boolean => {
  return !!operation.getExtension('internal');
};

/**
 * Defines which OpenAPI operations to include in iteration.
 */
type OperationFilter = {
  /**
   * If true, deprecated operations will be included (by default they are not).
   */
  deprecated?: boolean;

  /**
   * If true, internal operations will be included (by default they are not).
   */
  internal?: boolean;

  /**
   * If it is not empty, only operations assigned tags from this set will be
   * iterated over. If not set, no filtering on tags will be performed.
   */
  tags?: string[];
};

/**
 * Iterates over Operation objects of an OpenAPI schema, taking into account filtering criteria.
 */
export const getOperations = function* getOperations(
  openapi: OpenAPIModel,
  options?: OperationFilter,
): IterableIterator<OperationModel> {
  const includeDeprecated = options?.deprecated ?? false;
  const includeInternal = options?.internal ?? false;
  const includeTags = options?.tags?.length ? new Set<string>(options.tags) : null;

  const hasTag = (operation: OperationModel): boolean => {
    for (const tag of operation.tags()) {
      if (includeTags?.has(tag)) {
        return true;
      }
    }
    return false;
  };

  for (const [, pathItem] of openapi.paths.pathItems()) {
    for (const [, operation] of pathItem.operations()) {
      if (
        (includeDeprecated || !operation.deprecated) &&
        (includeInternal || !isInternalOperation(operation)) &&
        (!includeTags || hasTag(operation))
      ) {
        yield operation;
      }
    }
  }
};

export const getOperationEntryKey = (operation: OperationModel): string | undefined => {
  const result = operation.getExtension('entry-key');
  assert(result === undefined || typeof result === 'string');
  return result;
};

export const getOperationEntryKeyOrThrow = (operation: OperationModel): string => {
  const entryKey = getOperationEntryKey(operation);
  assert(
    typeof entryKey === 'string' && entryKey,
    `Missing x-entry-key in "${operation.parent.pathUrl}" path item`,
  );
  return entryKey;
};

/**
 * Iterates over all Parameter objects applicable to given Operation. This includes
 * iterating over parameters defined at the operation level, followed by iterating
 * parameters defined on PathItem level (excluding parameters that were overriden).
 */
export const getOperationParameters = function* getOperationParameters(
  operation: OperationModel,
): IterableIterator<ParameterModel> {
  const visited = new Set<string>();
  for (const param of operation.parameters()) {
    visited.add(`${param.in}:${param.name}`);
    yield param;
  }
  for (const param of operation.parent.parameters()) {
    const key = `${param.in}:${param.name}`;
    if (!visited.has(key)) {
      visited.add(key);
      yield param;
    }
  }
};

export const getOperationId = (operation: OperationModel): string | undefined => {
  const result = operation.operationId ?? operation.getExtension('codegen-operation');
  assert(result === undefined || typeof result === 'string');
  return result;
};

export const getOperationIdOrThrow = (operation: OperationModel): string => {
  const operationId = getOperationId(operation);
  assert(
    typeof operationId === 'string' && operationId,
    `Cannot evaluate operation name - both operationId and x-codegen-operation are missing in "${operation.parent.pathUrl}" path item`,
  );
  return operationId;
};

/**
 * Returns cache options for given operation. Return undefined is no options have been specified.
 */
export const getOperationCacheOptions = (
  operation: OperationModel,
): boolean | number | undefined => {
  const cache = operation.getExtension('cache');
  assert(
    cache === undefined || typeof cache === 'boolean' || typeof cache === 'number',
    `x-cache in "${operation.parent.pathUrl}" has wrong type ${typeof cache}`,
  );
  return cache;
};

/**
 * Returns cache options for given operation. Throws in no options have been specified.
 */
export const getOperationCacheOptionsOrThrow = (operation: OperationModel): boolean | number => {
  const result = getOperationCacheOptions(operation);
  assert(result, `Expected "${operation.parent.pathUrl}" to have cache options`);
  return result;
};

export const MEDIA_TYPE_JSON = 'application/json';
export const MEDIA_TYPE_JSON_API = 'application/vnd.api+json';

export const getMediaType = (useJsonApi: boolean) =>
  useJsonApi ? MEDIA_TYPE_JSON_API : MEDIA_TYPE_JSON;

export const getOperationRequestBodySchema = (
  operation: OperationModel,
  useJsonApi: boolean,
): Nullable<SchemaModel> => {
  const mediaType = getMediaType(useJsonApi);
  return operation.requestBody?.getMediaTypeOrThrow(mediaType).schema ?? null;
};

export const getOperationRequestBodySchemaOrThrow = (
  operation: OperationModel,
  useJsonApi: boolean,
): SchemaModel => {
  const schema = getOperationRequestBodySchema(operation, useJsonApi);
  assert(
    schema,
    `Expected to find non-null request body schema in "${operation.parent.pathUrl}" operation`,
  );
  return schema;
};

export const getOperationDefaultResponseSchema = (
  operation: OperationModel,
  useJsonApi: boolean,
): Nullable<SchemaModel> => {
  const mediaType = getMediaType(useJsonApi);
  return operation.responses.default?.getMediaTypeOrThrow(mediaType).schema ?? null;
};

export const getOperationDefaultResponseSchemaOrThrow = (
  operation: OperationModel,
  useJsonApi: boolean,
): Nullable<SchemaModel> => {
  const result = getOperationDefaultResponseSchema(operation, useJsonApi);
  assert(
    result,
    `Expected to find non-null default response schema in "${operation.parent.pathUrl}" operation`,
  );
  return result;
};

export const getOperationResponseSchemas = (
  operation: OperationModel,
  useJsonApi: boolean,
): SchemaModel[] => {
  const mediaType = getMediaType(useJsonApi);
  const result: SchemaModel[] = [];
  for (const [, response] of operation.responses.responses()) {
    const schema = response.getMediaType(mediaType)?.schema;
    if (schema) {
      result.push(schema);
    }
  }
  return result;
};

/**
 * Converts OpenAPI-style URI template (e.g. /employees/{id}/tasks) to Express-style path
 * (e.g. /employees/:id/tasks), which is called URL expression. Transformations include:
 *
 * - removing leading slash
 * - replacing {param} parameters with :param ones
 */
export const pathUrlToUrlExp = (pathItemUrl: string): string => {
  return pathItemUrl
    .replace(/^\//, '')
    .replace(/\{[a-zA-Z0-9_-]+\}/g, (param: string): string => `:${camelCase(param.slice(1, -1))}`);
};

/**
 * Given an instance of a SchemaModel and a name of a property, returns subschemas
 * defining this properties. Own properties, as well as all clauses (allOf, anyOf and
 * oneOf) are included into the search.
 *
 * @param schema schema instance
 * @param name property name
 * @returns list of subschemas for given property, defined either directly in the
 *  scheme, or in any composite clauses thereof.
 */
export const getSchemaMultiProperty = (schema: SchemaModel, name: string): SchemaModel[] => {
  const result: SchemaModel[] = [];
  for (const subschema of [
    schema,
    ...(schema.allOf ?? []),
    ...(schema.oneOf ?? []),
    ...(schema.anyOf ?? []),
  ]) {
    if (subschema.type === 'object') {
      const propertySchema = subschema.getProperty(name);
      if (propertySchema) {
        result.push(propertySchema);
      }
    }
  }
  return result;
};

/**
 * Iterates over schema's properties. Firstly, iterates over own properties, then
 * over properties of subschemas from allOf clause.
 *
 * @param schema schema
 * @return iterator over schema properties
 */
export const getSchemaProperties = function* getSchemaProperties(
  schema: SchemaModel,
): IterableIterator<[string, SchemaModel]> {
  const visited = new Set<string>();
  for (const [name, subschema] of schema.properties) {
    visited.add(name);
    yield [name, subschema];
  }
  if (schema.allOf?.length) {
    for (const subschema of schema.allOf) {
      for (const [subname, subsubschema] of subschema.properties) {
        if (!visited.has(subname)) {
          visited.add(subname);
          yield [subname, subsubschema];
        }
      }
    }
  }
};

export const getNumericSchemaRange = (
  schema: SchemaModel,
  precision = 0.0,
): { min?: number; max?: number } => {
  assert(
    schema.type === 'integer' || schema.type === 'number',
    'This function is indended to work for numeric schemas only',
  );

  let { minimum, maximum } = schema;
  const delta = schema.type === 'integer' ? 1 : precision;

  if (minimum != null && schema.exclusiveMinimum) {
    minimum += delta;
  }
  if (maximum != null && schema.exclusiveMaximum) {
    maximum -= delta;
  }

  return {
    min: minimum ?? undefined,
    max: maximum ?? undefined,
  };
};

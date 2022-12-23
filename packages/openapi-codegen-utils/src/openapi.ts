import assert from 'assert';

import { camelCase } from './string';

import type { Nullable } from '@fresha/api-tools-core';
import type { OpenAPIModel, OperationModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

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
  return operation.requestBody?.getContentOrThrow(mediaType).schema ?? null;
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
  return operation.responses.default?.getContentOrThrow(mediaType).schema ?? null;
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

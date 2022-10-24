import assert from 'assert';

import type { OpenAPIModel, OperationModel, PathsModel } from '@fresha/openapi-model/build/3.0.3';
import { camelCase } from './string';

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

// eslint-disable-next-line consistent-return
const findOperationPathUrl = (operation: OperationModel): string => {
  const paths = operation.parent.parent as PathsModel;
  for (const [pathItemUrl, pathItem] of paths) {
    if (pathItem === operation.parent) {
      return pathItemUrl;
    }
  }
  assert.fail(`Cannot find operation`);
};

export const getOperationEntryKeyOrThrow = (operation: OperationModel): string => {
  const entryKey = getOperationEntryKey(operation);
  assert(
    typeof entryKey === 'string' && entryKey,
    `Missing x-entry-key in "${findOperationPathUrl(operation)}" path item`,
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
    `Cannot evaluate operation name - both operationId and x-codegen-operation are missing in "${findOperationPathUrl(
      operation,
    )}" path item`,
  );
  return operationId;
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
}

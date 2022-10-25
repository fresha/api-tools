import assert from 'assert';

import { camelCase } from '@fresha/openapi-codegen-utils';

import type { PathItemOperationKey } from '@fresha/openapi-model/build/3.0.3';

/**
 * Supported operation templates.
 */
export type APIOperationTemplateName =
  | 'list'
  | 'read'
  | 'create'
  | 'update'
  | 'patch'
  | 'update'
  | 'delete'
  | 'single-read'
  | 'single-update'
  | 'single-patch'
  | 'single-delete';

export type OperationTemplate = {
  name: APIOperationTemplateName;
  actionName: (entryKey: string) => string;
  httpMethod: string;
  hasRequestBody: boolean;
  makeUrl: (urlBase: string) => string;
};

const OPERATION_TEMPLATES_LIST: OperationTemplate[] = [
  {
    name: 'list',
    actionName: (entryKey: string): string => camelCase(`read_${entryKey}_list`),
    httpMethod: 'get',
    hasRequestBody: false,
    makeUrl: (urlBase: string): string => urlBase,
  },
  {
    name: 'read',
    actionName: (entryKey: string): string => camelCase(`read_${entryKey}`),
    httpMethod: 'get',
    hasRequestBody: false,
    makeUrl: (urlBase: string): string => (urlBase.includes(':id') ? urlBase : `${urlBase}/:id`),
  },
  {
    name: 'single-read',
    actionName: (entryKey: string): string => camelCase(`read_${entryKey}`),
    httpMethod: 'get',
    hasRequestBody: false,
    makeUrl: (urlBase: string): string => urlBase,
  },
  {
    name: 'create',
    actionName: (entryKey: string): string => camelCase(`create_${entryKey}`),
    httpMethod: 'post',
    hasRequestBody: true,
    makeUrl: (urlBase: string): string => urlBase,
  },
  {
    name: 'update',
    actionName: (entryKey: string): string => camelCase(`update_${entryKey}`),
    httpMethod: 'put',
    hasRequestBody: true,
    makeUrl: (urlBase: string): string => (urlBase.includes(':id') ? urlBase : `${urlBase}/:id`),
  },
  {
    name: 'single-update',
    actionName: (entryKey: string): string => camelCase(`update_${entryKey}`),
    hasRequestBody: true,
    httpMethod: 'put',
    makeUrl: (urlBase: string): string => urlBase,
  },
  {
    name: 'patch',
    actionName: (entryKey: string): string => camelCase(`patch_${entryKey}`),
    httpMethod: 'patch',
    hasRequestBody: true,
    makeUrl: (urlBase: string): string => (urlBase.includes(':id') ? urlBase : `${urlBase}/:id`),
  },
  {
    name: 'single-patch',
    actionName: (entryKey: string): string => camelCase(`patch_${entryKey}`),
    httpMethod: 'patch',
    hasRequestBody: true,
    makeUrl: (urlBase: string): string => urlBase,
  },
  {
    name: 'delete',
    actionName: (entryKey: string): string => camelCase(`delete_${entryKey}`),
    httpMethod: 'delete',
    hasRequestBody: false,
    makeUrl: (urlBase: string): string => (urlBase.includes(':id') ? urlBase : `${urlBase}/:id`),
  },
  {
    name: 'single-delete',
    actionName: (entryKey: string): string => camelCase(`delete_${entryKey}`),
    httpMethod: 'delete',
    hasRequestBody: false,
    makeUrl: (urlBase: string): string => urlBase,
  },
];

export const OPERATION_TEMPLATES_MAP = Object.fromEntries<OperationTemplate>(
  OPERATION_TEMPLATES_LIST.map(template => [template.name, template]),
) as Record<APIOperationTemplateName, OperationTemplate>;

export const findOperationTemplate = (
  httpMethod: PathItemOperationKey,
  itemPath: string,
  entryKey: string,
  operationId?: string,
): { name: APIOperationTemplateName; template: OperationTemplate } => {
  let templateName: APIOperationTemplateName | null = null;
  if (httpMethod === 'get') {
    if (itemPath.includes('{id}')) {
      templateName = 'read';
    } else {
      const singleReadTemplate = OPERATION_TEMPLATES_MAP['single-read'];
      if (singleReadTemplate.actionName(entryKey) === operationId) {
        templateName = 'single-read';
      } else {
        templateName = 'list';
      }
    }
  } else if (httpMethod === 'post') {
    templateName = 'create';
  } else if (httpMethod === 'put') {
    templateName = itemPath.includes('{id}') ? 'update' : 'single-update';
  } else if (httpMethod === 'patch') {
    templateName = itemPath.includes('{id}') ? 'patch' : 'single-patch';
  } else if (httpMethod === 'delete') {
    templateName = itemPath.includes('{id}') ? 'delete' : 'single-delete';
  }
  assert(templateName, `Unsupported http method ${httpMethod}`);

  const template = OPERATION_TEMPLATES_MAP[templateName];
  assert(template, `Unsupported operation template name ${templateName}`);

  return { template, name: templateName };
};

import {
  addResourceAttributes,
  MEDIA_TYPE_JSON_API,
  setDataDocumentSchema,
} from '@fresha/openapi-codegen-utils';
import {
  OpenAPIFactory,
  OpenAPIModel,
  OperationModel,
  SchemaFactory,
} from '@fresha/openapi-model/build/3.0.3';

import { createTestContext } from '../testHelpers';

import { ActionsSignatures } from './ActionsSignatures';

import '@fresha/openapi-codegen-test-utils/build/matchers';

const createActionsSignatures = (openapi: OpenAPIModel): ActionsSignatures => {
  const context = createTestContext(openapi);
  const sourceFile = context.project.createSourceFile('index.ts', '');
  return new ActionsSignatures(context, sourceFile);
};

test('action cache', () => {
  const openapi = OpenAPIFactory.create('testApi', '2.2.2');

  const operation = openapi.setPathItem('/provider').setOperation('get');
  operation.operationId = 'readProvider';
  operation.setExtension('entry-key', 'provider');
  operation.setExtension('cache', 60);

  const actionsSignatures = createActionsSignatures(openapi);
  actionsSignatures.collectData();
  actionsSignatures.generateCode();

  expect(actionsSignatures.sourceFile).toHaveFormattedTypeScriptText(`
    export type TestApiActions = {
      readProvider: {
        (): Promise<Response>;
        apiName: 'readProvider';
        cache: Map<string, unknown>;
      };
    };

    export const testApi = boundActions(store, configuredApi) as TestApiActions;
  `);
});

const addPagingParams = (operation: OperationModel): void => {
  const offsetParam = operation.addParameter('offset', 'query');
  offsetParam.required = true;
  offsetParam.schema = SchemaFactory.create(offsetParam, 'number');
  const limitParam = operation.addParameter('limit', 'query');
  limitParam.required = true;
  limitParam.schema = SchemaFactory.create(limitParam, 'number');
  const searchParam = operation.addParameter('search', 'query');
  searchParam.required = false;
  searchParam.schema = SchemaFactory.create(searchParam, 'string');
  searchParam.schema.nullable = true;
};

test('GET actions', () => {
  const openapi = OpenAPIFactory.create('testApi', '0.1.0');

  const readList = openapi.setPathItem('/employees').setOperation('get');
  readList.operationId = 'readEmployeeListNoParams';
  readList.setExtension('entry-key', 'employee');

  const readListWithParams = openapi.setPathItem('/tasks').setOperation('get');
  readListWithParams.setExtension('entry-key', 'task');
  addPagingParams(readListWithParams);

  const actionsSignatures = createActionsSignatures(openapi);
  actionsSignatures.collectData();
  actionsSignatures.generateCode();

  expect(actionsSignatures.sourceFile).toHaveFormattedTypeScriptText(`
    export type TestApiActions = {
      readEmployeeListNoParams: {
        (): Promise<Response>;
        apiName: 'readEmployeeListNoParams';
        cache: null;
      };
      readTaskList: {
        (args: {
          offset: number;
          limit: number;
          search?: string | null;
        }): Promise<Response>;
        apiName: 'readTaskList';
        cache: null;
      };
    };

    export const testApi = boundActions(store, configuredApi) as TestApiActions;
  `);
});

test('create actions', () => {
  const openapi = OpenAPIFactory.create('testApi', '0.1.0');

  const simpleCreate = openapi.setPathItem('/tasks').setOperation('post');
  simpleCreate.operationId = 'createTask';
  simpleCreate.setExtension('entry-key', 'task');
  addPagingParams(simpleCreate);

  const requestBodySchema = simpleCreate
    .setRequestBody()
    .setContent(MEDIA_TYPE_JSON_API)
    .setSchema('object');
  setDataDocumentSchema(requestBodySchema, 'create-request');
  addResourceAttributes(requestBodySchema.getPropertyOrThrow('data'), {
    name: { type: 'string', required: true },
    age: 'number',
  });

  const responseSchema = simpleCreate
    .setDefaultResponse('success')
    .setContent(MEDIA_TYPE_JSON_API)
    .setSchema('object');
  setDataDocumentSchema(responseSchema, 'employees');

  const actionsSignatures = createActionsSignatures(openapi);
  actionsSignatures.collectData();
  actionsSignatures.generateCode();

  expect(actionsSignatures.sourceFile).toHaveFormattedTypeScriptText(`
    import type { JSONObject } from '@fresha/noname-core';

    export type TestApiActions = {
      createTask: {
        (args: {
          offset: number;
          limit: number;
          search?: string | null;
          jsonapi?: {
            version: '1.0';
          };
          data: {
            type: 'create-request';
            id: string;
            attributes: {
              name: string;
              age?: number;
            };
            relationships?: JSONObject;
          };
        }): Promise<Response>;
        apiName: 'createTask';
        cache: null;
      };
    };

    export const testApi = boundActions(store, configuredApi) as TestApiActions;
  `);
});

test('update actions', () => {
  const openapi = OpenAPIFactory.create('testApi', '0.1.0');

  const simpleUpdate = openapi.setPathItem('/cart').setOperation('put');

  const idParam = simpleUpdate.addParameter('id', 'path');
  idParam.schema = SchemaFactory.create(idParam, 'string');

  simpleUpdate.operationId = 'updateCart';
  simpleUpdate.setExtension('entry-key', 'cart');

  const requestBodySchema = simpleUpdate
    .setRequestBody()
    .setContent(MEDIA_TYPE_JSON_API)
    .setSchema('object');
  setDataDocumentSchema(requestBodySchema, 'update-cart-request');
  addResourceAttributes(requestBodySchema.getPropertyOrThrow('data'), {
    sku: { type: 'string', required: true },
    quantity: { type: 'integer', required: true },
    days: { type: 'array', required: true },
    extra: null,
  });

  const actionsSignatures = createActionsSignatures(openapi);
  actionsSignatures.collectData();
  actionsSignatures.generateCode();

  expect(actionsSignatures.sourceFile).toHaveFormattedTypeScriptText(`
    import type { JSONArray, JSONValue, JSONObject } from '@fresha/noname-core';

    export type TestApiActions = {
      updateCart: {
        (
          id: ResourceId,
          args: {
            jsonapi?: {
              version: '1.0';
            };
            data: {
              type: 'update-cart-request';
              id: string;
              attributes: {
                sku: string;
                quantity: number;
                days: JSONArray;
                extra?: JSONValue;
              };
              relationships?: JSONObject;
            };
          },
        ): Promise<Response>;
        apiName: 'updateCart';
        cache: null;
      };
    };

    type ResourceId = string | number;

    export const testApi = boundActions(store, configuredApi) as TestApiActions;
  `);
});

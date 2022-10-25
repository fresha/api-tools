import {
  addResourceAttributes,
  createLogger,
  setDataDocumentSchema,
} from '@fresha/openapi-codegen-utils';
import {
  OpenAPIFactory,
  OpenAPIModel,
  OperationModel,
  SchemaFactory,
} from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { ActionsSignatures } from './ActionsSignatures';

import type { Generator } from './Generator';

import '@fresha/jest-config';

const makeActionsSignatures = (openapi: OpenAPIModel): ActionsSignatures => {
  const logger = createLogger(false);
  const tsProject = new Project({ useInMemoryFileSystem: true });
  const tsSourceFile = tsProject.createSourceFile('index.ts', '');

  const actionsSignatures = new ActionsSignatures({
    options: {
      useJsonApi: true,
    },
    apiName: 'testApi',
    openapi,
    logger,
    tsSourceFile,
  } as Generator);

  return actionsSignatures;
};

test('action cache', () => {
  const openapi = OpenAPIFactory.create('cache-api', '2.2.2');

  const operation = openapi.setPathItem('/provider').setOperation('get');
  operation.operationId = 'readProvider';
  operation.setExtension('entry-key', 'provider');
  operation.setExtension('cache', 60);

  const actionsSignatures = makeActionsSignatures(openapi);
  actionsSignatures.collectData();
  actionsSignatures.generateCode();

  expect(actionsSignatures.tsSourceFile).toHaveFormattedText(`
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
  const openapi = OpenAPIFactory.create('test-api', '0.1.0');

  const readList = openapi.setPathItem('/employees').setOperation('get');
  readList.operationId = 'readEmployeeListNoParams';
  readList.setExtension('entry-key', 'employee');

  const readListWithParams = openapi.setPathItem('/tasks').setOperation('get');
  readListWithParams.setExtension('entry-key', 'task');
  addPagingParams(readListWithParams);

  const actionsSignatures = makeActionsSignatures(openapi);
  actionsSignatures.collectData();
  actionsSignatures.generateCode();

  expect(actionsSignatures.tsSourceFile).toHaveFormattedText(`
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
  const openapi = OpenAPIFactory.create('test-api', '0.1.0');

  const simpleCreate = openapi.setPathItem('/tasks').setOperation('post');
  simpleCreate.operationId = 'createTask';
  simpleCreate.setExtension('entry-key', 'task');
  addPagingParams(simpleCreate);

  const requestBodySchema = simpleCreate
    .setRequestBody()
    .setContent('application/vnd.api+json')
    .setSchema('object');
  setDataDocumentSchema(requestBodySchema, 'create-request');
  addResourceAttributes(requestBodySchema.getPropertyOrThrow('data'), {
    name: { type: 'string', required: true },
    age: 'number',
  });

  const responseSchema = simpleCreate
    .setDefaultResponse('success')
    .setContent('application/vnd.api+json')
    .setSchema('object');
  setDataDocumentSchema(responseSchema, 'employees');

  const actionsSignatures = makeActionsSignatures(openapi);
  actionsSignatures.collectData();
  actionsSignatures.generateCode();

  expect(actionsSignatures.tsSourceFile).toHaveFormattedText(`
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
  const openapi = OpenAPIFactory.create('test-api', '0.1.0');

  const simpleUpdate = openapi.setPathItem('/cart').setOperation('put');

  const idParam = simpleUpdate.addParameter('id', 'path');
  idParam.schema = SchemaFactory.create(idParam, 'string');

  simpleUpdate.operationId = 'updateCart';
  simpleUpdate.setExtension('entry-key', 'cart');

  const requestBodySchema = simpleUpdate
    .setRequestBody()
    .setContent('application/vnd.api+json')
    .setSchema('object');
  setDataDocumentSchema(requestBodySchema, 'update-cart-request');
  addResourceAttributes(requestBodySchema.getPropertyOrThrow('data'), {
    sku: { type: 'string', required: true },
    quantity: { type: 'integer', required: true },
    days: { type: 'array', required: true },
    extra: null,
  });

  const actionsSignatures = makeActionsSignatures(openapi);
  actionsSignatures.collectData();
  actionsSignatures.generateCode();

  expect(actionsSignatures.tsSourceFile).toHaveFormattedText(`
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

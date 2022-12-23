import { OpenAPIFactory, OpenAPIModel, SchemaFactory } from '@fresha/openapi-model/build/3.0.3';

import { makeContext } from '../testUtils';

import { APIConfig } from './APIConfig';

import '@fresha/code-morph-test-utils/build/matchers';

const makeApiConfig = (openapi: OpenAPIModel): APIConfig => {
  const context = makeContext(openapi);
  const sourceFile = context.project.createSourceFile('index.ts', '');
  return new APIConfig(context, sourceFile);
};

test('happy path', () => {
  const openapi = OpenAPIFactory.create('testApi', '0.1.0');
  openapi.paths.setExtension('root-url', 'API_CONFIG_URL');

  const operationQueryParams = openapi.setPathItem('/tasks').setOperation('get');
  operationQueryParams.operationId = 'readTaskList';
  operationQueryParams.setExtension('entry-key', 'task');

  const offsetParam = operationQueryParams.addParameter('offset', 'query');
  offsetParam.required = true;
  offsetParam.schema = SchemaFactory.create(offsetParam, 'number');
  const limitParam = operationQueryParams.addParameter('limit', 'query');
  limitParam.required = true;
  limitParam.schema = SchemaFactory.create(limitParam, 'number');
  const searchParam = operationQueryParams.addParameter('search', 'query');
  searchParam.required = false;
  searchParam.schema = SchemaFactory.create(searchParam, 'string');
  searchParam.schema.nullable = true;

  const apiConfig = makeApiConfig(openapi);
  apiConfig.collectData();
  apiConfig.generateCode();

  expect(apiConfig.sourceFile).toHaveFormattedTypeScriptText(`
    import { APIEnvironmentOptions } from '@fresha/connector-utils/build/types/api';
    import store from '@fresha/redux-store';
    import { configureApi } from '@fresha/connector-utils/build/apiConfig';
    import { boundActions } from '@fresha/connector-utils/build/boundActions';
    import { env } from '@fresha/connector-utils/build/env';

    export function makeApiConfig({ API_CONFIG_URL }: Pick<APIEnvironmentOptions, 'API_CONFIG_URL'>) {
      const config = [
        {
          task: {
            url: 'tasks',
            operations: [
              [
                'list', {
                  queryParams: ['offset', 'limit', 'search'],
                },
              ],
            ],
          },
        },
        {
          rootUrl: API_CONFIG_URL,
          adapter: 'jsonapi',
        },
      ] as const;
      return config;
    }

    const apiConfig = makeApiConfig(env);
    export const configuredApi = configureApi([apiConfig], 'testApi');
  `);
});

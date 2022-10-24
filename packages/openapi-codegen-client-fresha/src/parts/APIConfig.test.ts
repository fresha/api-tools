import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { APIConfig } from './APIConfig';

import type { Generator } from './Generator';

import '@fresha/jest-config';

const makeApiConfig = (openapi: OpenAPIModel): APIConfig => {
  const logger = createLogger(false);
  const tsProject = new Project({ useInMemoryFileSystem: true });
  const tsSourceFile = tsProject.createSourceFile('index.ts', '');

  const apiConfig = new APIConfig({
    options: {
      useJsonApi: true,
    },
    apiName: 'testApi',
    openapi,
    logger,
    tsSourceFile,
  } as Generator);

  return apiConfig;
};

test('happy path', () => {
  const openapi = OpenAPIFactory.create('test-api', '0.1.0');
  const apiConfig = makeApiConfig(openapi);

  apiConfig.collectData();
  apiConfig.generateCode();

  expect(apiConfig.tsSourceFile).toHaveFormattedText(`
    import { APIEnvironmentOptions } from '@fresha/connector-utils/build/types/api';
    import store from '@fresha/redux-store';
    import { configureApi } from '@fresha/connector-utils/build/apiConfig';
    import { boundActions } from '@fresha/connector-utils/build/boundActions';
    import { env } from '@fresha/connector-utils/build/env';

    function makeApiConfig({ API_URL }: Pick<APIEnvironmentOptions, 'API_URL'>) {
      const config = [
        {},
        {
          rootUrl: API_URL,
          adapter: 'jsonapi',
        },
      ] as const;
      return config;
    }

    const apiConfig = makeApiConfig(env);
    export const configuredApi = configureApi([apiConfig], 'testApi');
  `);
});

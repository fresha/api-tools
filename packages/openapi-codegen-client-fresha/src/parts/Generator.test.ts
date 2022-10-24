import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { Generator } from './Generator';

import '@fresha/jest-config';

const makeOpenApi = (): OpenAPIModel => {
  const openapi = OpenAPIFactory.create('generator-test-api', '1.2.3');
  openapi.paths.setExtension('root-url', 'PROFILE_API_URL');

  const profileItem = openapi.setPathItem('/profile');

  const readProfileOperation = profileItem.setOperation('get');
  readProfileOperation.operationId = 'readProfile';
  readProfileOperation.setExtension('entry-key', 'profile');

  const updateProfileOperation = profileItem.setOperation('patch');
  updateProfileOperation.operationId = 'updateProfile';
  updateProfileOperation.setExtension('entry-key', 'profile');

  return openapi;
};

test('renders init function, configured api variable, as well as action types', () => {
  const openapi = makeOpenApi();
  const tsProject = new Project({ useInMemoryFileSystem: true });
  const logger = createLogger(false);

  const generator = new Generator(
    openapi,
    tsProject,
    { outputPath: '/', useJsonApi: true, dryRun: false },
    logger,
  );

  generator.collectData();
  generator.generateCode();

  expect(tsProject.getSourceFileOrThrow('/src/index.ts')).toHaveFormattedText(`
    import { APIEnvironmentOptions } from '@fresha/connector-utils/build/types/api';
    import store from '@fresha/redux-store';
    import { configureApi } from '@fresha/connector-utils/build/apiConfig';
    import { boundActions } from '@fresha/connector-utils/build/boundActions';
    import { env } from '@fresha/connector-utils/build/env';

    function makeApiConfig({ PROFILE_API_URL }: Pick<APIEnvironmentOptions, 'PROFILE_API_URL'>) {
      const config = [
        {
          profile: {
            url: 'profile',
            operations: [
              'single-read',
              [
                'single-patch',
                {
                  actionName: 'updateProfile',
                },
              ],
            ],
          },
        },
        {
          rootUrl: PROFILE_API_URL,
          adapter: 'jsonapi',
        },
      ] as const;
      return config;
    }

    const apiConfig = makeApiConfig(env);
    export const configuredApi = configureApi([apiConfig], 'generator-test-api');

    export type GeneratorTestActions = {
      readProfile: () => Promise<Response>;
      updateProfile: (args: {}) => Promise<Response>;
    };

    export const generatorTestApi = boundActions(
      store,
      configuredApi,
    ) as GeneratorTestActions;
  `);
});

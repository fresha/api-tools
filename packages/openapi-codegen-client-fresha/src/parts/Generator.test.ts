import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { createTestContext } from '../testHelpers';

import { Generator } from './Generator';

import '@fresha/openapi-codegen-test-utils/build/matchers';

const createOpenApi = (): OpenAPIModel => {
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
  const openapi = createOpenApi();
  const context = createTestContext(openapi);

  const generator = new Generator(context);

  generator.run();

  expect(context.project.getSourceFileOrThrow('/src/index.ts')).toHaveFormattedTypeScriptText(`
    import { APIEnvironmentOptions } from '@fresha/connector-utils/build/types/api';
    import store from '@fresha/redux-store';
    import { configureApi } from '@fresha/connector-utils/build/apiConfig';
    import { boundActions } from '@fresha/connector-utils/build/boundActions';
    import { env } from '@fresha/connector-utils/build/env';

    export function makeApiConfig({ PROFILE_API_URL }: Pick<APIEnvironmentOptions, 'PROFILE_API_URL'>) {
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
      readProfile: {
        (): Promise<Response>;
        apiName: 'readProfile';
        cache: null;
      };
      updateProfile: {
        (): Promise<Response>;
        apiName: 'updateProfile';
        cache: null;
      };
    };

    export const generatorTestApi = boundActions(
      store,
      configuredApi,
    ) as GeneratorTestActions;
  `);
});

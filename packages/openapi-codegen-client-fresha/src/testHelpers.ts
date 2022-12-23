// eslint-disable-next-line import/no-extraneous-dependencies
import { createTSProjectTestContext } from '@fresha/openapi-codegen-test-utils';
import { getAPIName, getRootUrlOrThrow } from '@fresha/openapi-codegen-utils';

import type { Context } from './context';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const createTestContext = (openapi: OpenAPIModel, rootDir = '/'): Context => {
  const base = createTSProjectTestContext(openapi, rootDir);

  let apiRootUrl: string;
  try {
    apiRootUrl = getRootUrlOrThrow(openapi);
  } catch (err) {
    apiRootUrl = 'API_URL';
  }

  return {
    ...base,
    apiName: getAPIName(openapi),
    apiRootUrl,
  };
};

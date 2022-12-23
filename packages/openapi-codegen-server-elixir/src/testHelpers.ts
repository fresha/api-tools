import { Project } from '@fresha/code-morph-ex';
import { createRegistry } from '@fresha/json-api-model';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createTestContext as createBaseTestContext } from '@fresha/openapi-codegen-test-utils';
import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';

import { Generator } from './parts';

import type { Context } from './context';

export const createTestContext = (phoenixApp: string, rootDir = '/'): Context => {
  const openapi = OpenAPIFactory.create();
  const base = createBaseTestContext(openapi, rootDir);

  const project = new Project({
    rootDir,
    phoenixApp,
    useInMemoryFileSystem: true,
  });

  return {
    ...base,
    testObjectFactoryModuleName: `${project.getAppModuleName()}.Factory`,
    openapi,
    project,
    registry: createRegistry(),
  };
};

export const createGenerator = (phoenixApp = 'api_tools_web'): Generator => {
  const context = createTestContext(phoenixApp, '/');
  const generator = new Generator(context);
  return generator;
};

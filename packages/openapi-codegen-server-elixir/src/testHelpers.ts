import { Project } from '@fresha/ex-morph';
import { createRegistry } from '@fresha/json-api-model';
import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { Context, Generator } from './parts';

export const makeContext = (phoenixApp: string, rootDir = '/'): Context => {
  const project = new Project({
    rootDir,
    phoenixApp,
    useInMemoryFileSystem: true,
  });

  return {
    outputPath: rootDir,
    useJsonApi: true,
    testObjectFactoryModuleName: `${project.getAppModuleName()}.Factory`,
    dryRun: false,
    openapi: OpenAPIFactory.create(),
    project,
    registry: createRegistry(),
    consoleWriter: jest.fn(),
    logger: createLogger(false),
  };
};

const makeGenerator = (phoenixApp = 'api_tools_web', rootDir = '/') => {
  return new Generator(makeContext(phoenixApp, rootDir));
};

type TestingContext = {
  openapi: OpenAPIModel;
  generator: Generator;
};

export const makeTestingContext = (phoenixApp = 'api_tools_web'): TestingContext => {
  const generator = makeGenerator(phoenixApp);
  return { generator, openapi: generator.context.openapi };
};

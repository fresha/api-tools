import {
  createConsole,
  createLogger,
  getAPIName,
  getRootUrlOrThrow,
} from '@fresha/openapi-codegen-utils';
import { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { Context } from './parts/types';

export const makeContext = (openapi: OpenAPIModel, rootDir = '/'): Context => {
  const project = new Project({
    useInMemoryFileSystem: true,
  });

  const console = createConsole(false);
  console.log = jest.fn();

  let apiRootUrl: string;
  try {
    apiRootUrl = getRootUrlOrThrow(openapi);
  } catch (err) {
    apiRootUrl = 'API_URL';
  }

  return {
    outputPath: rootDir,
    useJsonApi: true,
    dryRun: false,
    openapi,
    project,
    console,
    logger: createLogger(false),
    apiName: getAPIName(openapi),
    apiRootUrl,
  };
};

import console from 'console';

import { Project } from '@fresha/ex-morph';
import { createRegistry } from '@fresha/json-api-model';
import {
  createLogger,
  builder as basicBuilder,
  Params as BasicParams,
} from '@fresha/openapi-codegen-utils';
import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';

import { Generator } from './parts';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'server-elixir';

export const description = 'Generates code for Elixir (Phoenix) servers';

type Params = BasicParams & {
  phoenixApp?: string;
  testFactoryModule?: string;
};

export const builder = (yarg: Argv): Argv<Params> =>
  basicBuilder(yarg)
    .string('phoenix-app')
    .describe('phoenix-app', 'Create files inside given Phoenix application name')
    .demandOption('phoenix-app')
    .string('test-factory-module')
    .describe('test-factory-module', 'Specifies module name of the test object factory')
    .demandOption('test-factory-module');

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const openapiReader = new OpenAPIReader();
  const openapi = openapiReader.parseFromFile(args.input);

  const project = new Project({
    rootDir: args.output,
    phoenixApp: args.phoenixApp!,
    overwriteFiles: true,
  });

  const logger = createLogger(!!args.verbose);

  const generator = new Generator({
    outputPath: args.output,
    useJsonApi: !!args.jsonApi,
    testObjectFactoryModuleName: args.testFactoryModule!,
    dryRun: !!args.dryRun,
    openapi,
    project,
    registry: createRegistry(),
    consoleWriter: console.log,
    logger,
  });

  generator.run();
};

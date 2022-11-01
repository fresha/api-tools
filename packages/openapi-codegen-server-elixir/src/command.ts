import { Project } from '@fresha/ex-morph';
import { createRegistry } from '@fresha/json-api-model';
import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';

import { Generator } from './parts';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'server-elixir';

export const description = 'Generates code for Elixir (Phoenix) servers';

type Params = {
  input: string;
  output: string;
  phoenixApp?: string;
  testFactoryModule?: string;
  jsonApi?: boolean;
  verbose?: boolean;
};

export const parser = (yarg: Argv): Argv<Params> => {
  return yarg
    .string('i')
    .alias('i', 'input')
    .describe('i', 'Input schema')
    .demandOption('i')
    .demandOption('input')
    .string('o')
    .alias('o', 'output')
    .describe('o', 'Output directory (NestJS package root)')
    .demandOption('o')
    .demandOption('output')
    .string('phoenix-app')
    .describe('phoenix-app', 'Create files inside given Phoenix application name')
    .demandOption('phoenix-app')
    .string('test-factory-module')
    .describe('test-factory-module', 'Specifies module name of the test object factory')
    .demandOption('test-factory-module')
    .string('json-api')
    .describe('json-api', 'Uses JSON:API extensions')
    .boolean('verbose')
    .describe('verbose', 'prints additional information')
    .boolean('dry-run')
    .describe('dry-run', 'Does not modify files');
};

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
    logger,
  });

  generator.run();
};

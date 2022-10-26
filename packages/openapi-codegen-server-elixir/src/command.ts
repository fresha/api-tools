import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';

import { getPhoenixAppPath, Generator } from './parts';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'server-elixir';

export const description = 'Generates code for Elixir (Phoenix) servers';

type Params = {
  input: string;
  output: string;
  phoenixApp?: string;
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

  const logger = createLogger(!!args.verbose);

  const generator = new Generator(
    openapi,
    {
      outputPath: getPhoenixAppPath(args.output, args.phoenixApp!),
      phoenixApp: args.phoenixApp ?? 'app',
      useJsonApi: !!args.jsonApi,
      verbose: !!args.verbose,
      dryRun: !!args.dryRun,
    },
    logger,
  );

  generator.collectData();
  generator.generateCode();
};

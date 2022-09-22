import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';

import { Generator } from './Generator';
import { getPhoenixAppPath } from './utils';

import type { Argv, ArgumentsCamelCase } from 'yargs';

type Params = {
  input: string;
  output: string;
  phoenixApp?: string;
  jsonApi?: boolean;
  verbose?: boolean;
};

const parser = (yarg: Argv): Argv<Params> => {
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

const handler = (args: ArgumentsCamelCase<Params>): void => {
  const openapiReader = new OpenAPIReader();
  const openapi = openapiReader.parseFromFile(args.input);

  const generator = new Generator(openapi, {
    outputPath: getPhoenixAppPath(args.output, args.phoenixApp!),
    phoenixApp: args.phoenixApp ?? 'app',
    useJsonApi: !!args.jsonApi,
    verbose: !!args.verbose,
    dryRun: !!args.dryRun,
  });

  generator.run();
};

export const register = (argv: Argv): void => {
  argv.command(
    'server-elixir',
    '(experimental) generates code for Elixir (Phoenix)',
    parser,
    handler,
  );
};

import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';

import { Generator } from './Generator';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'server-mock';

export const description = 'Generates code for mock servers based on Mirage.js';

type Params = {
  input: string;
  output: string;
  jsonApi?: boolean;
  verbose?: boolean;
};

export const parser = (yarg: Argv): Argv<Params> => {
  return yarg
    .string('input')
    .alias('input', 'i')
    .describe('input', 'Input schema')
    .demandOption('input')
    .string('output')
    .alias('output', 'o')
    .describe('output', 'Output directory (NestJS package root)')
    .demandOption('output')
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

  const generator = new Generator(openapi, {
    outputPath: args.output,
    useJsonApi: !!args.jsonApi,
    verbose: !!args.verbose,
    dryRun: !!args.dryRun,
  });

  generator.collectData();
  generator.generateCode();
};

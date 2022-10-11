import path from 'path';

import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { Generator } from './Generator';

import type { Argv, ArgumentsCamelCase } from 'yargs';

type Params = {
  input: string;
  output: string;
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
    .describe('o', 'Output directory (NPM package root)')
    .demandOption('o')
    .demandOption('output')
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

  const tsProject = new Project({
    tsConfigFilePath: path.join(args.output, 'tsconfig.json'),
  });

  const generator = new Generator(openapi, tsProject, {
    outputPath: args.output,
    useJsonApi: !!args.jsonApi,
    verbose: !!args.verbose,
    dryRun: !!args.dryRun,
  });

  generator.run();
};

export const register = (argv: Argv): void => {
  argv.command(
    'client-fresha',
    '(experimental) generates code for Fresha clients',
    parser,
    handler,
  );
};

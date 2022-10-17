import path from 'path';

import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { Generator } from './Generator';
import { createLogger } from './utils/logging';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'client-fresha';

export const description = 'generates code for Fresha clients';

type Params = {
  input: string;
  output: string;
  jsonApi?: boolean;
  verbose?: boolean;
};

export const builder = (yarg: Argv): Argv<Params> => {
  return yarg
    .string('input')
    .alias('input', 'i')
    .describe('input', 'Input schema')
    .demandOption('input')
    .string('output')
    .alias('output', 'o')
    .describe('output', 'Output directory (NPM package root)')
    .demandOption('output')
    .boolean('json-api')
    .describe('json-api', 'Uses JSON:API extensions')
    .boolean('verbose')
    .describe('verbose', 'prints additional information')
    .boolean('dry-run')
    .describe('dry-run', 'Does not modify files');
};

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const openapiReader = new OpenAPIReader();
  const openapi = openapiReader.parseFromFile(args.input);

  const tsProject = new Project({
    tsConfigFilePath: path.join(args.output, 'tsconfig.json'),
  });

  const logger = createLogger(!!args.verbose);

  const generator = new Generator(
    openapi,
    tsProject,
    {
      outputPath: args.output,
      useJsonApi: !!args.jsonApi,
      dryRun: !!args.dryRun,
    },
    logger,
  );

  generator.collectData();
  generator.generateCode();
};

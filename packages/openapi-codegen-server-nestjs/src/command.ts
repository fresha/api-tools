import path from 'path';

import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { Generator } from './Generator';
import { getNestJSSubAppPath } from './utils';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'server-nestjs';

export const description = 'generates code for NestJS';

type Params = {
  input: string;
  output: string;
  nestApp?: string;
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
    .describe('output', 'Output directory (NestJS package root)')
    .demandOption('output')
    .string('nest-app')
    .describe('nest-app', 'Create files inside given NestJS application name')
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

  const tsProject = new Project({
    tsConfigFilePath: path.join(args.output, 'tsconfig.json'),
  });

  const logger = createLogger(!!args.verbose);

  const generator = new Generator(
    openapi,
    tsProject,
    {
      outputPath: getNestJSSubAppPath(args.output, args.nestApp),
      nestApp: args.nestApp ?? 'app',
      useJsonApi: !!args.jsonApi,
      dryRun: !!args.dryRun,
    },
    logger,
  );

  generator.collectData();
  generator.generateCode();
};

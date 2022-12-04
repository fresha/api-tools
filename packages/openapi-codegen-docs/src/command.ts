import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';

import { Generator } from './parts';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'docs-json-api';

export const description = 'generate documentation for JSON:API APIs (experimental)';

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
    .boolean('verbose')
    .describe('verbose', 'prints additional information')
    .boolean('dry-run')
    .describe('dry-run', 'Does not modify files');
};

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const openapiReader = new OpenAPIReader();
  const openapi = openapiReader.parseFromFile(args.input);

  const logger = createLogger(!!args.verbose);

  const generator = new Generator({
    outputPath: args.output,
    logger,
    dryRun: !!args.dryRun,
    openapi,
  });

  generator.run();
};

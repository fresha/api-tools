import type { Argv } from 'yargs';

export type Params = {
  input: string;
  output: string;
  jsonApi?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
};

export const builder = <T>(yarg: Argv<T>): Argv<Params> =>
  yarg
    .string('input')
    .alias('input', 'i')
    .describe('input', 'Input schema')
    .demandOption('i')
    .demandOption('input')
    .string('output')
    .alias('output', 'o')
    .describe('output', 'Output directory')
    .demandOption('output')
    .boolean('json-api')
    .describe('json-api', 'Uses JSON:API extensions')
    .boolean('verbose')
    .describe('verbose', 'Prints additional information')
    .boolean('dry-run')
    .describe('dry-run', 'Does not modify files');

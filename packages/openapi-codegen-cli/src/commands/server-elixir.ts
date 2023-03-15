import {
  Generator,
  createContext,
  CreateContextParams,
} from '@fresha/openapi-codegen-server-elixir';

import { builder as baseBuilder } from './common';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'server-elixir';

export const description = 'Generates code for Elixir (Phoenix) servers';

export const builder = (yarg: Argv): Argv<CreateContextParams> =>
  baseBuilder(yarg)
    .string('phoenix-app')
    .describe('phoenix-app', 'Create files inside given Phoenix application name')
    .demandOption('phoenix-app')
    .string('test-factory-module')
    .describe('test-factory-module', 'Specifies module name of the test object factory')
    .demandOption('test-factory-module');

export const handler = (args: ArgumentsCamelCase<CreateContextParams>): void => {
  const context = createContext(args);
  const generator = new Generator(context);
  generator.run();
};

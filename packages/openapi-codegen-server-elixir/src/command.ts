import { Project } from '@fresha/code-morph-ex';
import { createJSONAPISchemaRegistry } from '@fresha/json-api-model';
import {
  builder as basicBuilder,
  Params as BasicParams,
  createContext,
} from '@fresha/openapi-codegen-utils';

import { Generator } from './parts';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'server-elixir';

export const description = 'Generates code for Elixir (Phoenix) servers';

type Params = BasicParams & {
  phoenixApp?: string;
  testFactoryModule?: string;
};

export const builder = (yarg: Argv): Argv<Params> =>
  basicBuilder(yarg)
    .string('phoenix-app')
    .describe('phoenix-app', 'Create files inside given Phoenix application name')
    .demandOption('phoenix-app')
    .string('test-factory-module')
    .describe('test-factory-module', 'Specifies module name of the test object factory')
    .demandOption('test-factory-module');

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const context = createContext(args);

  const project = new Project({
    rootDir: args.output,
    phoenixApp: args.phoenixApp!,
    overwriteFiles: true,
  });

  const generator = new Generator({
    ...context,
    testObjectFactoryModuleName: args.testFactoryModule!,
    project,
    registry: createJSONAPISchemaRegistry(),
  });

  generator.run();
};

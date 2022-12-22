import path from 'path';

import { createContext, Params } from '@fresha/openapi-codegen-utils';
import { Project } from 'ts-morph';

import { Generator } from './Generator';

import type { ArgumentsCamelCase } from 'yargs';

export { builder } from '@fresha/openapi-codegen-utils';

export const command = 'client-fetch';

export const description = 'generates code for fetch() API clients';

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const context = createContext(args);

  const project = new Project({
    tsConfigFilePath: path.join(args.output, 'tsconfig.json'),
  });

  const generator = new Generator({
    ...context,
    project,
  });

  generator.collectData();
  generator.generateCode();
};

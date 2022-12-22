import path from 'path';

import { createContext, Params } from '@fresha/openapi-codegen-utils';
import { Project } from 'ts-morph';

import { Generator } from './Generator';

import type { ArgumentsCamelCase } from 'yargs';

export { builder } from '@fresha/openapi-codegen-utils';

export const command = 'server-mock';

export const description = 'Generates code for mock servers based on Mirage.js';

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const project = new Project({
    tsConfigFilePath: path.join(args.output, 'tsconfig.json'),
  });

  const context = createContext(args);

  const generator = new Generator({
    ...context,
    project,
  });

  generator.run();
};

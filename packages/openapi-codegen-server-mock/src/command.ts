import { createTSProjectContext, Params } from '@fresha/openapi-codegen-utils';

import { Generator } from './Generator';

import type { ArgumentsCamelCase } from 'yargs';

export { builder } from '@fresha/openapi-codegen-utils';

export const command = 'server-mock';

export const description = 'Generates code for mock servers based on Mirage.js';

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const context = createTSProjectContext(args);
  const generator = new Generator(context);

  generator.run();
};

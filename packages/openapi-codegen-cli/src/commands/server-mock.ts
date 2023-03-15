import { createContext, Generator, CreateContextParams } from '@fresha/openapi-codegen-server-mock';

import type { ArgumentsCamelCase } from 'yargs';

export const command = 'server-mock';

export const description = 'Generates code for mock servers based on Mirage.js';

export const handler = (args: ArgumentsCamelCase<CreateContextParams>): void => {
  const context = createContext(args);
  const generator = new Generator(context);
  generator.run();
};

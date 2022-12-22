import { createContext, Params } from '@fresha/openapi-codegen-utils';

import { Generator } from './parts';

import type { ArgumentsCamelCase } from 'yargs';

export { builder } from '@fresha/openapi-codegen-utils';

export const command = 'docs-json-api';

export const description = 'generate documentation for JSON:API APIs (experimental)';

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const context = createContext(args);
  const generator = new Generator(context);

  generator.run();
};

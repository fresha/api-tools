import {
  createContext,
  Generator,
  CreateContextParams,
} from '@fresha/openapi-codegen-docs-json-api';

import type { ArgumentsCamelCase } from 'yargs';

export const command = 'docs-json-api';

export const description = 'generate documentation for JSON:API APIs (experimental)';

export const handler = (args: ArgumentsCamelCase<CreateContextParams>): void => {
  const context = createContext(args);
  const generator = new Generator(context);
  generator.run();
};

import {
  Generator,
  createContext,
  CreateContextParams,
} from '@fresha/openapi-codegen-client-fetch';

import { builder as baseBuilder } from './common';

import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'client-fetch';

export const description = 'generates code for fetch() API clients';

export const builder = (args: Argv): Argv<CreateContextParams> =>
  baseBuilder(args)
    .boolean('with-deprecated')
    .describe('with-deprecated', 'Generated code for deprecated operations')
    .default('with-deprecated', false)
    .boolean('with-internal')
    .describe('with-internal', 'Generate code for internal operation')
    .default('with-internal', false)
    .array('with-tags')
    .describe('with-tags', 'Generate only operation with tags')
    .array('without-tags')
    .describe('without-tags', 'Generates operations not assigned with this tags')
    .boolean('with-formatters')
    .describe('with-formatters', 'Generate request formatters')
    .choices('api-naming', ['camel', 'kebab', 'snake', 'title'])
    .describe('api-naming', 'Naming convention in OpenAPI schema')
    .choices('client-naming', ['camel', 'kebab', 'snake', 'title'])
    .describe('client-naming', 'Naming convention on a client');

export const handler = (args: ArgumentsCamelCase<CreateContextParams>): void => {
  const context = createContext(args);
  const generator = new Generator(context);
  generator.run();
};

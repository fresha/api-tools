import {
  builder as baseBuilder,
  createTSProjectContext,
  Params as BaseParams,
} from '@fresha/openapi-codegen-utils';

import { Generator } from './Generator';

import type { NamingConvention } from './context';
import type { Argv, ArgumentsCamelCase } from 'yargs';

export const command = 'client-fetch';

export const description = 'generates code for fetch() API clients';

type Params = BaseParams & {
  withDeprecated?: boolean;
  withInternal?: boolean;
  withTags?: string[];
  withoutTags?: string[];
  withFormatters?: boolean;
  apiNaming?: NamingConvention;
  clientNaming?: NamingConvention;
};

export const builder = (args: Argv): Argv<Params> =>
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

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const baseContext = createTSProjectContext(args);

  const generator = new Generator({
    ...baseContext,
    includeDeprecated: !!args.withDeprecated,
    includeInternal: !!args.withInternal,
    includedTags: new Set<string>(args.withTags),
    excludedTags: new Set<string>(args.withoutTags),
    withFormatters: !!args.withFormatters,
    apiNaming: args.apiNaming ?? null,
    clientNaming: args.clientNaming ?? null,
  });

  generator.run();
};

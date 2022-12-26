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
  withTags?: string[];
  withoutTags?: string[];
  transformRequest?: NamingConvention;
  transformResponse?: NamingConvention;
};

export const builder = (args: Argv): Argv<Params> =>
  baseBuilder(args)
    .boolean('with-deprecated')
    .default('with-deprecated', false)
    .describe('with-deprecated', 'Generated code for deprecated operations')
    .array('with-tags')
    .describe('with-tags', 'Generate only operation with tags')
    .array('without-tags')
    .describe('without-tags', 'Generates operations not assigned with this tags')
    .choices('transform-request', ['camel', 'kebab', 'snake'])
    .describe('transform-request', 'Transforms request bodies to specified convention')
    .choices('transform-response', ['camel', 'kebab', 'snake'])
    .describe('transform-response', 'Converts responses to specified convention');

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const baseContext = createTSProjectContext(args);

  const generator = new Generator({
    ...baseContext,
    includeDeprecated: !!args.withDeprecated,
    includedTags: new Set<string>(args.withTags),
    excludedTags: new Set<string>(args.withoutTags),
    transformRequest: args.transformRequest ?? null,
    transformResponse: args.transformResponse ?? null,
  });

  generator.run();
};

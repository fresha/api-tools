import { createTSProjectContext, TSProjectContext } from '@fresha/openapi-codegen-utils';

import type { Nullable } from '@fresha/api-tools-core';
import type { OperationModel } from '@fresha/openapi-model/build/3.0.3';
import type { SourceFile } from 'ts-morph';

export type NamingConvention = 'camel' | 'kebab' | 'snake' | 'title';

export interface Context extends TSProjectContext {
  readonly includeDeprecated: boolean;
  readonly includeInternal: boolean;
  readonly includedTags: Set<string>;
  readonly excludedTags: Set<string>;
  readonly withFormatters: boolean;
  readonly apiNaming: Nullable<NamingConvention>;
  readonly clientNaming: Nullable<NamingConvention>;
}

export interface ActionContext extends Context {
  readonly operation: OperationModel;
  readonly sourceFile: SourceFile;
  readonly formattersFile: SourceFile;
  readonly typesFile: SourceFile;
}

export interface CreateContextParams {
  input: string;
  output: string;
  jsonApi?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
  withDeprecated?: boolean;
  withInternal?: boolean;
  withTags?: string[];
  withoutTags?: string[];
  withFormatters?: boolean;
  apiNaming?: NamingConvention;
  clientNaming?: NamingConvention;
}

export const createContext = (args: CreateContextParams): Context => {
  const baseContext = createTSProjectContext(args);

  return {
    ...baseContext,
    includeDeprecated: !!args.withDeprecated,
    includeInternal: !!args.withInternal,
    includedTags: new Set<string>(args.withTags),
    excludedTags: new Set<string>(args.withoutTags),
    withFormatters: !!args.withFormatters,
    apiNaming: args.apiNaming ?? null,
    clientNaming: args.clientNaming ?? null,
  };
};

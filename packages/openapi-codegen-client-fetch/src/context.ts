import type { Nullable } from '@fresha/api-tools-core';
import type { TSProjectContext } from '@fresha/openapi-codegen-utils';
import type { OperationModel } from '@fresha/openapi-model/build/3.0.3';
import type { SourceFile } from 'ts-morph';

export type NamingConvention = 'camel' | 'kebab' | 'snake';

export interface Context extends TSProjectContext {
  readonly includeDeprecated: boolean;
  readonly includedTags: Set<string>;
  readonly excludedTags: Set<string>;
  readonly transformRequest: Nullable<NamingConvention>;
  readonly transformResponse: Nullable<NamingConvention>;
}

export interface ActionContext extends Context {
  readonly operation: OperationModel;
  readonly sourceFile: SourceFile;
}
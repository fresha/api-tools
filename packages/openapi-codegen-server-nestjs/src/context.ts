import assert from 'assert';

import { createTSProjectContext, TSProjectContext } from '@fresha/openapi-codegen-utils';

import { getNestJSSubAppPath } from './utils';

import type { DTO } from './DTO';
import type { Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export interface Context extends TSProjectContext {
  readonly nestApp: string;

  addDTO(name: string, schema: Nullable<SchemaModel>): DTO;
}

export interface CreateContextParams {
  input: string;
  output: string;
  jsonApi?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
  nestApp?: string;
}

export const createContext = (args: CreateContextParams): Context => {
  return {
    ...createTSProjectContext(args),
    outputPath: getNestJSSubAppPath(args.output, args.nestApp),
    nestApp: args.nestApp ?? 'app',
    addDTO() {
      assert.fail('Not implemented');
    },
  };
};

// eslint-disable-next-line import/no-extraneous-dependencies
import { createTSProjectTestContext } from '@fresha/openapi-codegen-test-utils';

import type { ActionContext, Context } from './context';
import type { OpenAPIModel, OperationModel } from '@fresha/openapi-model/build/3.0.3';

export const createTestContext = (openapi: OpenAPIModel): Context => {
  const base = createTSProjectTestContext(openapi);

  return {
    ...base,
    includeDeprecated: false,
    includedTags: new Set<string>(),
    excludedTags: new Set<string>(),
    transformRequest: 'kebab',
    transformResponse: 'camel',
  };
};

export const createActionTestContext = (
  operation: OperationModel,
  fileName: string,
): ActionContext => {
  const base = createTestContext(operation.root);
  const sourceFile = base.project.createSourceFile(fileName, '');

  return {
    ...base,
    sourceFile,
    operation,
  };
};

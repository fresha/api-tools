import { getFileName } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'operation-tags';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  const hasTags = openapi.tagCount > 0;
  if (hasTags) {
    for (const [pathUrl, pathItem] of openapi.paths.pathItems()) {
      for (const [httpMethod, operation] of pathItem.operations()) {
        if (!operation.tagCount) {
          result.addIssue({
            ruleId: id,
            severity: options.severity,
            file: getFileName(openapi),
            line: -1,
            pointer: `#/paths/${pathUrl}/${httpMethod}/tags`,
            message: `Operation ${httpMethod.toUpperCase()} ${pathUrl} does not use tags defined in the schema`,
          });
        }
      }
    }
  }
  return false;
};

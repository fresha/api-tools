import { getFileName } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'operation-tags-defined';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  const tagNames = new Set<string>(openapi.tagNames());
  for (const [pathUrl, pathItem] of openapi.paths.pathItems()) {
    for (const [httpMethod, operation] of pathItem.operations()) {
      for (const operationTag of operation.tags()) {
        if (!tagNames.has(operationTag)) {
          result.addIssue({
            ruleId: id,
            severity: options.severity,
            file: getFileName(openapi),
            line: -1,
            pointer: `#/paths/${pathUrl}/${httpMethod}/tags`,
            message: `Operation ${httpMethod.toUpperCase()} ${pathUrl} has tag ${operationTag} which is not defined in the schema`,
          });
        }
      }
    }
  }
  return false;
};

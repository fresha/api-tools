import { getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'operation-success-response';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  for (const [pathUrl, pathItem] of openapi.paths.pathItems()) {
    for (const [httpMethod, operation] of pathItem.operations()) {
      if (!isDisabled(operation, id)) {
        let hasSuccessResponse = false;
        for (const code of operation.responses.responseCodes()) {
          const codeNumber = Number(code);
          if (codeNumber >= 200 && codeNumber < 400) {
            hasSuccessResponse = true;
          }
        }
        if (!hasSuccessResponse) {
          result.addIssue({
            ruleId: id,
            severity: options.severity,
            file: getFileName(openapi),
            line: -1,
            pointer: `#/paths/${pathUrl}/${httpMethod}/responses`,
            message: `Operation ${httpMethod.toUpperCase()} '${pathUrl}' does not define any success responses`,
          });
        }
      }
    }
  }
  return false;
};

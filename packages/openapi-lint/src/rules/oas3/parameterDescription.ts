import { enumerate, getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'parameter-description';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  for (const [pathUrl, pathItem] of openapi.paths.pathItems()) {
    for (const [param, index] of enumerate(pathItem.parameters())) {
      if (!isDisabled(pathItem, id)) {
        if (!param.description) {
          result.addIssue({
            ruleId: id,
            severity: options.severity,
            file: getFileName(openapi),
            line: -1,
            pointer: `#/paths${pathUrl}/parameters/${index}`,
            message: `Parameter ${param.name} of the ${pathUrl} item does not have a description`,
          });
        }
      }
    }

    for (const [httpMethod, operation] of pathItem.operations()) {
      for (const [param, index] of enumerate(operation.parameters())) {
        if (!isDisabled(operation, id)) {
          if (!param.description) {
            result.addIssue({
              ruleId: id,
              severity: options.severity,
              file: getFileName(openapi),
              line: -1,
              pointer: `#/paths${pathUrl}/${httpMethod}/parameters/${index}`,
              message: `Parameter ${
                param.name
              } of ${httpMethod.toUpperCase()} ${pathUrl} operation does not have a description`,
            });
          }
        }
      }
    }
  }

  return false;
};

import { enumerate, getFileName } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'operation-params-unique';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  for (const [pathUrl, pathItem] of openapi.paths.pathItems()) {
    const pathItemParams = new Set<string>();
    for (const [param, index] of enumerate(pathItem.parameters())) {
      const key = `${param.in}:${param.name}`;
      if (pathItemParams.has(key)) {
        result.addIssue({
          ruleId: id,
          severity: options.severity,
          file: getFileName(openapi),
          line: -1,
          pointer: `#/paths/${pathUrl}/parameters/${index}`,
          message: `Duplicate parameter '${key}' in path item '${pathUrl}'`,
        });
      } else {
        pathItemParams.add(key);
      }
    }

    for (const [httpMethod, operation] of pathItem.operations()) {
      const operationParams = new Set<string>();
      for (const [param, index] of enumerate(operation.parameters())) {
        const key = `${param.in}:${param.name}`;
        if (pathItemParams.has(key)) {
          result.addIssue({
            ruleId: id,
            severity: options.severity,
            file: getFileName(openapi),
            line: -1,
            pointer: `#/paths/${pathUrl}/${httpMethod}/parameters/${index}`,
            message: `Duplicate parameter '${key}' in operation ${httpMethod.toLocaleUpperCase()} '${pathUrl}'`,
          });
        } else {
          operationParams.add(key);
        }
      }
    }
  }

  return false;
};

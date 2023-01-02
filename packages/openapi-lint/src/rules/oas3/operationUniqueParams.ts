import { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../LinterResult';
import { RuleFunc } from '../types';
import { isDisabled } from '../utils';

export const id = 'operation-params-unique';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  for (const [pathUrl, pathItem] of openapi.paths) {
    const pathItemParams = new Set<string>();
    for (const param of pathItem.parameters) {
      if (!isDisabled(pathItem, id)) {
        const key = `${param.in}:${param.name}`;
        if (pathItemParams.has(key)) {
          result.addError(`Duplicate parameter '${key}' in path item '${pathUrl}'`);
        } else {
          pathItemParams.add(key);
        }
      }
    }

    for (const [httpMethod, operation] of pathItem.operations()) {
      if (!isDisabled(operation, id)) {
        const operationParams = new Set<string>();
        for (const param of operation.parameters) {
          const key = `${param.in}:${param.name}`;
          if (pathItemParams.has(key)) {
            result.addError(
              `Duplicate parameter ${key} in operation ${httpMethod.toLocaleUpperCase()} '${pathUrl}'`,
            );
          } else {
            operationParams.add(key);
          }
        }
      }
    }
  }

  return false;
};

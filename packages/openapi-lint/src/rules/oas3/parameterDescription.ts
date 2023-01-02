import { isDisabled } from '../utils';

import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'parameter-description';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  for (const [pathUrl, pathItem] of openapi.paths) {
    if (!isDisabled(pathItem, id)) {
      for (const param of pathItem.parameters) {
        if (!param.description) {
          result.addError(
            `Parameter ${param.name} of the ${pathUrl} item does not have a description`,
          );
        }
      }
    }

    for (const [httpMethod, operation] of pathItem.operations()) {
      if (!isDisabled(operation, id)) {
        for (const param of operation.parameters) {
          if (!param.description) {
            result.addError(
              `Parameter ${
                param.name
              } of ${httpMethod.toUpperCase()} ${pathUrl} operation does not have a description`,
            );
          }
        }
      }
    }
  }

  return false;
};

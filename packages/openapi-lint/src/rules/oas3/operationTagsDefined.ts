import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'operation-tags-defined';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  const tagNames = new Set<string>(openapi.tagNames());
  for (const [pathUrl, pathItem] of openapi.paths.pathItems()) {
    for (const [httpMethod, operation] of pathItem.operations()) {
      for (const operationTag of operation.tags()) {
        if (!tagNames.has(operationTag)) {
          result.addWarning(
            `Operation ${httpMethod.toUpperCase()} ${pathUrl} has tag ${operationTag} which is not defined in the schema`,
          );
        }
      }
    }
  }
  return false;
};

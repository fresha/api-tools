import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel, OperationModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'operation-id-is-unique';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  const operationIds = new Map<string, Set<OperationModel>>();

  for (const [pathUrl, pathItem] of openapi.paths.pathItems()) {
    for (const [httpMethod, operation] of pathItem.operations()) {
      if (!operation.operationId) {
        result.addError(`Operation ${httpMethod.toUpperCase()} '${pathUrl}' has empty ID`);
      } else {
        let ops = operationIds.get(operation.operationId);
        if (!ops) {
          ops = new Set<OperationModel>();
          operationIds.set(operation.operationId, ops);
        }
        ops.add(operation);
      }
    }
  }

  for (const [operationId, operations] of operationIds) {
    if (operations.size > 1) {
      result.addError(`Operation ID '${operationId}' is used in ${operations.size} operations`);
    }
  }

  return false;
};

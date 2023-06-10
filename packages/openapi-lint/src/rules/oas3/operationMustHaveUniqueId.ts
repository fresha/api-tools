import { getFileName } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel, OperationModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'operation-id-is-unique';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  const operationIds = new Map<string, Set<OperationModel>>();

  for (const [, pathItem] of openapi.paths.pathItems()) {
    for (const [, operation] of pathItem.operations()) {
      if (operation.operationId) {
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
      result.addIssue({
        ruleId: id,
        severity: options.severity,
        file: getFileName(openapi),
        line: -1,
        pointer: `#/paths/*/*`,
        message: `Operation ID '${operationId}' is not unique`,
      });
    }
  }

  return false;
};

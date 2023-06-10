import { getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'schemas-ids-are-unique';

export const autoFixable = false;

const uuids = new Set<string>();

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  if (!isDisabled(openapi.info, id)) {
    const schemaId = openapi.info.getExtension('id');
    if (typeof schemaId === 'string') {
      if (uuids.has(schemaId)) {
        result.addIssue({
          ruleId: id,
          severity: options.severity,
          file: getFileName(openapi),
          line: -1,
          pointer: '#/info/x-id',
          message: `Duplicate schema ID: ${schemaId}`,
        });
      } else {
        uuids.add(schemaId);
      }
    }
  }
  return false;
};

export const reset = (): void => {
  uuids.clear();
};

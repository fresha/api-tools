import { getFileName } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'schemas-ids-are-unique';

export const autoFixable = false;

const uuids = new Map<string, Set<string>>();

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  const schemaId = openapi.info.getExtension('id');
  if (schemaId && typeof schemaId === 'string' && uuids.has(schemaId)) {
    result.addIssue({
      ruleId: id,
      severity: options.severity,
      file: getFileName(openapi),
      line: -1,
      pointer: '#/info/x-id',
      message: `Duplicate schema ID: ${schemaId}`,
    });
  }
  return false;
};

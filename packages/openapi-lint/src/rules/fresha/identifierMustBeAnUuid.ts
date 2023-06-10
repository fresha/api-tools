import { getFileName } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'schema-id-is-uuid';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  const schemaId = openapi.info.getExtension('id');
  if (
    !schemaId ||
    typeof schemaId !== 'string' ||
    !schemaId.match(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
    )
  ) {
    result.addIssue({
      ruleId: id,
      severity: options.severity,
      file: getFileName(openapi),
      line: -1,
      pointer: '#/info/x-id',
      message: 'Schema ID is missing or is not an UUID',
    });
  }
  return false;
};

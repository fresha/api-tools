import { getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'info-properties';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  if (!isDisabled(openapi, id)) {
    const { title, description } = openapi.info;
    if (!title || typeof title !== 'string') {
      result.addIssue({
        ruleId: id,
        severity: options.severity,
        file: getFileName(openapi),
        line: -1,
        pointer: '#/info/title',
        message: 'Schema title must not be empty',
      });
    }
    if (!description || typeof description !== 'string') {
      result.addIssue({
        ruleId: id,
        severity: options.severity,
        file: getFileName(openapi),
        line: -1,
        pointer: '#/info/description',
        message: 'Schema description must not be empty',
      });
    }
  }
  return false;
};

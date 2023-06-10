import { getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'schema-version-is-semver';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  if (!isDisabled(openapi.info, id)) {
    const { version } = openapi.info;
    if (!version || typeof version !== 'string' || !version.match(/^\d+\.\d+\.\d+$/)) {
      result.addIssue({
        ruleId: id,
        severity: options.severity,
        file: getFileName(openapi),
        line: -1,
        pointer: '#/info/version',
        message: 'Version does not conform to semver 2.0 spec',
      });
    }
  }
  return false;
};

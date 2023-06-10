import { getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

const ALLOWED_AUDIENCE = [
  'internal-team',
  'internal-company',
  'external-partner',
  'external-public',
];

export const id = 'schema-audience-is-set';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  if (!isDisabled(openapi.info, id)) {
    const audience = openapi.info.getExtension('audience');
    if (!audience || typeof audience !== 'string' || !ALLOWED_AUDIENCE.includes(audience)) {
      result.addIssue({
        ruleId: id,
        severity: options.severity,
        file: getFileName(openapi),
        line: -1,
        pointer: '#/info/x-audience',
        message: `The 'x-audience' property is missing or has an illegal value: ${String(
          audience,
        )}`,
      });
    }
  }
  return false;
};

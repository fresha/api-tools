import { isDisabled } from '../utils';

import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

const ALLOWED_AUDIENCE = [
  'internal-team',
  'internal-company',
  'external-partner',
  'external-public',
];

export const id = 'schema-audience-is-set';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  if (!isDisabled(openapi.info, id)) {
    const audience = openapi.info.getExtension('audience');
    if (!audience || typeof audience !== 'string') {
      result.addError('x-audience property is missing');
    } else if (!ALLOWED_AUDIENCE.includes(audience)) {
      result.addError(`Audience property has illegal value: ${audience}`);
    }
  }
  return false;
};

import { isDisabled } from '../utils';

import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'server-list';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  if (!isDisabled(openapi, id)) {
    if (!openapi.serverCount) {
      result.addError(`Server list must not be empty`);
    }
  }
  return false;
};

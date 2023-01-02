import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'schema-version-is-semver';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  const { version } = openapi.info;
  if (!version || typeof version !== 'string' || !version.match(/^\d+\.\d+\.\d+$/)) {
    result.addError('Version does not conform to semver 2.0 spec');
  }
  return false;
};

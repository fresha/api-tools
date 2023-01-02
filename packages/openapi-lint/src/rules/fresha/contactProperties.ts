import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'contact-properties';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  const { contact } = openapi.info;
  if (!contact.name?.match(/^team-/)) {
    result.addError('Contact name must be valid team name');
  }
  if (!contact.url?.startsWith('https://github.com/orgs/surgeventures/teams/team-')) {
    result.addError('Contact URL must point to GitHub team page');
  }
  return false;
};

import { getFileName } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'contact-properties';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  const { contact } = openapi.info;
  if (!contact.name?.match(/^team-/)) {
    result.addIssue({
      ruleId: id,
      severity: options.severity,
      file: getFileName(openapi),
      line: -1,
      pointer: '#/info/contact/name',
      message: 'Contact name must be a valid team name',
    });
  }
  if (!contact.url?.startsWith('https://github.com/orgs/surgeventures/teams/team-')) {
    result.addIssue({
      ruleId: id,
      severity: options.severity,
      file: getFileName(openapi),
      line: -1,
      pointer: '#/info/contact/url',
      message: 'Contact URL must point to GitHub team page',
    });
  }
  return false;
};

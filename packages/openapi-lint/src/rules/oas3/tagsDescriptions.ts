import { enumerate, getFileName } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'tags-descriptions';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  for (const [tag, index] of enumerate(openapi.tags())) {
    if (!tag.description) {
      result.addIssue({
        ruleId: id,
        severity: options.severity,
        file: getFileName(openapi),
        line: -1,
        pointer: `#/tags/${index}`,
        message: `Tag '${tag.name}' does not have a description`,
      });
    }
  }
  return false;
};

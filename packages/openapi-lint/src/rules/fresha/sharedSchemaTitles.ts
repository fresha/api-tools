import { getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'shared-schema-title-is-set';

export const autoFixable = true;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  let modified = false;

  if (!isDisabled(openapi, id)) {
    for (const [key, schema] of openapi.components.schemas()) {
      if (!schema.title) {
        if (options.autoFix) {
          schema.title = key;
          modified = true;
        } else {
          result.addIssue({
            ruleId: id,
            severity: options.severity,
            file: getFileName(openapi),
            line: -1,
            pointer: `#/components/schemas/${key}`,
            message: `Schema title for key '${key}' must not be empty`,
          });
        }
      } else if (schema.title !== key) {
        result.addIssue({
          ruleId: id,
          severity: options.severity,
          file: getFileName(openapi),
          line: -1,
          pointer: `#/components/schemas/${key}`,
          message: `Shared schema title (${String(schema.title)}) is different from key (${key})`,
        });
      }
    }
  }

  return modified;
};

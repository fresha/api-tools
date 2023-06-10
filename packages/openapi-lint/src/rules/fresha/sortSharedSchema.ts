import { arrayEqual, getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'shared-schema-sort';

export const autoFixable = true;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  let modified = false;

  if (!isDisabled(openapi, id)) {
    const schemaKeys = Array.from(openapi.components.schemaKeys());
    const sortedSchemaKeys = schemaKeys.slice();
    sortedSchemaKeys.sort();

    if (!arrayEqual(schemaKeys, sortedSchemaKeys)) {
      if (options.autoFix) {
        openapi.components.sortSchemas(([key1]: [string, unknown], [key2]: [string, unknown]) =>
          key1.localeCompare(key2),
        );
        modified = true;
      } else {
        result.addIssue({
          ruleId: id,
          severity: options.severity,
          file: getFileName(openapi),
          line: -1,
          pointer: '#/components/schemas',
          message: 'Shared schemas must be sorted according to their keys',
        });
      }
    }
  }

  return modified;
};

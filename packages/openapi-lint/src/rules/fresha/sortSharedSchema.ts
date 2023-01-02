import { arrayEqual, isDisabled } from '../utils';

import type { LinterResult } from '../../LinterResult';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'shared-schema-sort';

export const autoFixable = true;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: LinterResult,
  options: RuleOptions,
): boolean => {
  let modified = false;

  if (!isDisabled(openapi, id)) {
    const schemaKeys = Array.from(openapi.components.schemas.keys());
    const sortedSchemaKeys = schemaKeys.slice();
    sortedSchemaKeys.sort();

    if (!arrayEqual(schemaKeys, sortedSchemaKeys)) {
      if (options.autoFix) {
        openapi.components.sortSchemas(([key1]: [string, unknown], [key2]: [string, unknown]) =>
          key1.localeCompare(key2),
        );
        modified = true;
      } else {
        result.addWarning('Shared schemas must be sorted according to their keys');
      }
    }
  }

  return modified;
};

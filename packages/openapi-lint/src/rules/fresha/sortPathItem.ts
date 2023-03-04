import { arrayEqual, isDisabled } from '../utils';

import type { LinterResult } from '../../LinterResult';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'path-items-sort';

export const autoFixable = true;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: LinterResult,
  options: RuleOptions,
): boolean => {
  let modified = false;

  if (!isDisabled(openapi, id)) {
    const pathUrls = Array.from(openapi.paths.pathItemUrls());
    const sortedPathUrls = pathUrls.slice();
    sortedPathUrls.sort();

    if (!arrayEqual(pathUrls, sortedPathUrls)) {
      if (options.autoFix) {
        openapi.paths.sort(([key1]: [string, unknown], [key2]: [string, unknown]) =>
          key1.localeCompare(key2),
        );
        modified = true;
      } else {
        result.addWarning('Path items must be sorted according to their URLs');
      }
    }
  }

  return modified;
};

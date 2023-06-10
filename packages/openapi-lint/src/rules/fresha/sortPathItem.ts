import { arrayEqual, getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'path-items-sort';

export const autoFixable = true;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  let modified = false;

  if (!isDisabled(openapi, id)) {
    const pathUrls = Array.from(openapi.paths.pathItemUrls());
    const sortedPathUrls = pathUrls.slice().sort();

    if (!arrayEqual(pathUrls, sortedPathUrls)) {
      if (options.autoFix) {
        openapi.paths.sort(([key1]: [string, unknown], [key2]: [string, unknown]) =>
          key1.localeCompare(key2),
        );
        modified = true;
      } else {
        result.addIssue({
          ruleId: id,
          severity: options.severity,
          file: getFileName(openapi),
          line: -1,
          pointer: '#/paths',
          message: 'Path items must be sorted according to their URLs',
        });
      }
    }
  }

  return modified;
};

import { getFileName, isDisabled } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'duplicate-tags';

export const autoFixable = true;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  let modified = false;

  if (!isDisabled(openapi, id)) {
    if (options.autoFix) {
      let i = openapi.tagCount - 1;
      while (i >= 0) {
        const tagName = openapi.tagAt(i).name;
        const j = openapi.indexOfTag(tagName);
        if (j >= 0 && j < i) {
          openapi.deleteTagAt(i);
          modified = true;
        }
        i -= 1;
      }
    } else {
      const tagNames = new Set<string>();
      for (const tag of openapi.tags()) {
        if (tagNames.has(tag.name)) {
          result.addIssue({
            ruleId: id,
            severity: options.severity,
            file: getFileName(openapi),
            line: -1,
            pointer: `#/tags/${tag.name}`,
            message: `Duplicate tag '${tag.name}'`,
          });
        } else {
          tagNames.add(tag.name);
        }
      }
    }
  }

  return modified;
};

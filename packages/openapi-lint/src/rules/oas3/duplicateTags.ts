import { isDisabled } from '../utils';

import type { LinterResult } from '../../LinterResult';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'duplicate-tags';

export const autoFixable = true;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: LinterResult,
  options: RuleOptions,
): boolean => {
  const modified = false;

  if (!isDisabled(openapi, id)) {
    if (options.autoFix) {
      let i = openapi.tags.length;
      while (i >= 0) {
        const tagName = openapi.tags[i].name;
        const j = openapi.tags.findIndex(tag => tag.name === tagName);
        if (j >= 0 && j < i) {
          openapi.deleteTagAt(i);
        }
        i -= 1;
      }
    } else {
      const tagNames = new Set<string>();
      for (const tag of openapi.tags) {
        if (tagNames.has(tag.name)) {
          result.addError(`Duplicate tag '${tag.name}'`);
        } else {
          tagNames.add(tag.name);
        }
      }
    }
  }

  return modified;
};

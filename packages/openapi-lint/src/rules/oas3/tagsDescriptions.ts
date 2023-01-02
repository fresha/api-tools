import { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../LinterResult';
import { RuleFunc } from '../types';

export const id = 'tags-descriptions';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  for (const tag of openapi.tags) {
    if (!tag.description) {
      result.addWarning(`Tag '${tag.name}' does not have a description`);
    }
  }
  return false;
};

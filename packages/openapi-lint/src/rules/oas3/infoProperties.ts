import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'info-properties';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  const { title, description } = openapi.info;
  if (!title || typeof title !== 'string') {
    result.addError('Schema title must not be empty');
  }
  if (!description || typeof description !== 'string') {
    result.addError('Schema description must not be empty');
  }
  return false;
};

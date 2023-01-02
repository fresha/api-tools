import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'schemas-ids-are-unique';

export const autoFixable = false;

const uuids = new Map<string, Set<string>>();

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  const schemaId = openapi.info.getExtension('id');
  if (schemaId && typeof schemaId === 'string' && uuids.has(schemaId)) {
    result.addError(`Duplicate schema ID: ${schemaId}`);
  }
  return false;
};

import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'schema-id-is-uuid';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  const schemaId = openapi.info.getExtension('id');
  if (
    !schemaId ||
    typeof schemaId !== 'string' ||
    !schemaId.match(
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
    )
  ) {
    result.addError('Schema ID must be a GUID');
  }
  return false;
};

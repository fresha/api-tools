import type { LinterResult } from '../../LinterResult';
import type { RuleFunc } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'no-server-url-trailing-slash';

export const autoFixable = false;

export const run: RuleFunc = (openapi: OpenAPIModel, result: LinterResult): boolean => {
  for (const server of openapi.servers) {
    if (server.url.endsWith('/')) {
      result.addWarning(`Server URL '${server.url}' must not have trailing slash`);
    }
  }
  return false;
};

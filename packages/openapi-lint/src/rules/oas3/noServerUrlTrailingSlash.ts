import { enumerate, getFileName } from '../utils';

import type { Result } from '../../types';
import type { RuleFunc, RuleOptions } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const id = 'no-server-url-trailing-slash';

export const autoFixable = false;

export const run: RuleFunc = (
  openapi: OpenAPIModel,
  result: Result,
  options: RuleOptions,
): boolean => {
  for (const [server, index] of enumerate(openapi.servers())) {
    if (server.url.endsWith('/')) {
      result.addIssue({
        ruleId: id,
        severity: options.severity,
        file: getFileName(openapi),
        line: -1,
        pointer: `#/servers/${index}/url`,
        message: `Server URL '${server.url}' must not have trailing slash`,
      });
    }
  }
  return false;
};

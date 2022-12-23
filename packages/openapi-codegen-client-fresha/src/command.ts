import {
  createTSProjectContext,
  getAPIName,
  getRootUrlOrThrow,
  Params,
} from '@fresha/openapi-codegen-utils';

import { Generator } from './parts';

import type { ArgumentsCamelCase } from 'yargs';

export { builder } from '@fresha/openapi-codegen-utils';

export const command = 'client-fresha';

export const description = 'generates code for Fresha clients';

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const context = createTSProjectContext(args);

  let apiRootUrl: string;
  try {
    apiRootUrl = getRootUrlOrThrow(context.openapi);
  } catch (err) {
    const message = (err as Record<string, unknown>)?.message;
    if (typeof message === 'string') {
      context.logger.info(message);
    } else {
      context.logger.info(err);
    }
    apiRootUrl = 'API_URL';
  }

  const generator = new Generator({
    ...context,
    apiName: getAPIName(context.openapi),
    apiRootUrl,
  });

  generator.run();
};

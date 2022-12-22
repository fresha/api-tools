import path from 'path';

import {
  createContext,
  getAPIName,
  getRootUrlOrThrow,
  Params,
} from '@fresha/openapi-codegen-utils';
import { Project } from 'ts-morph';

import { Generator } from './parts';

import type { ArgumentsCamelCase } from 'yargs';

export { builder } from '@fresha/openapi-codegen-utils';

export const command = 'client-fresha';

export const description = 'generates code for Fresha clients';

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const context = createContext(args);

  const project = new Project({
    tsConfigFilePath: path.join(args.output, 'tsconfig.json'),
  });

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
    project,
    apiName: getAPIName(context.openapi),
    apiRootUrl,
  });

  generator.run();
};

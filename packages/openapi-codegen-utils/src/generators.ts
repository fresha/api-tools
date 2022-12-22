import { OpenAPIModel, OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';

import { createConsole, createLogger, Logger } from './logging';

import type { Params } from './yargs';
import type { ArgumentsCamelCase } from 'yargs';

export interface Context {
  readonly openapi: OpenAPIModel;
  readonly outputPath: string;
  readonly useJsonApi: boolean;
  readonly dryRun: boolean;
  readonly logger: Logger;
  readonly console: Console;
}

export const createContext = (args: ArgumentsCamelCase<Params>): Context => {
  const openapiReader = new OpenAPIReader();
  const openapi = openapiReader.parseFromFile(args.input);

  return {
    openapi,
    outputPath: args.output,
    useJsonApi: !!args.jsonApi,
    dryRun: !!args.dryRun,
    logger: createLogger(!!args.verbose),
    console: createConsole(!!args.verbose),
  };
};

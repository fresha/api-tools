import { createLogger, Params } from '@fresha/openapi-codegen-utils';
import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';

import { Generator } from './parts';

import type { ArgumentsCamelCase } from 'yargs';

export { builder } from '@fresha/openapi-codegen-utils';

export const command = 'docs-json-api';

export const description = 'generate documentation for JSON:API APIs (experimental)';

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const openapiReader = new OpenAPIReader();
  const openapi = openapiReader.parseFromFile(args.input);

  const logger = createLogger(!!args.verbose);

  const generator = new Generator({
    outputPath: args.output,
    logger,
    dryRun: !!args.dryRun,
    openapi,
  });

  generator.run();
};

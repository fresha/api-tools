import path from 'path';

import { createLogger, Params } from '@fresha/openapi-codegen-utils';
import { OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { Generator } from './parts';

import type { ArgumentsCamelCase } from 'yargs';

export { builder } from '@fresha/openapi-codegen-utils';

export const command = 'client-fresha';

export const description = 'generates code for Fresha clients';

export const handler = (args: ArgumentsCamelCase<Params>): void => {
  const openapiReader = new OpenAPIReader();
  const openapi = openapiReader.parseFromFile(args.input);

  const tsProject = new Project({
    tsConfigFilePath: path.join(args.output, 'tsconfig.json'),
  });

  const logger = createLogger(!!args.verbose);

  const generator = new Generator(
    openapi,
    tsProject,
    {
      outputPath: args.output,
      useJsonApi: !!args.jsonApi,
      dryRun: !!args.dryRun,
    },
    logger,
  );

  generator.collectData();
  generator.generateCode();
};

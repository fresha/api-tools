import path from 'path';

import { OpenAPIModel, OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';
import { Project, SourceFile } from 'ts-morph';

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

export interface TSProjectContext extends Context {
  readonly project: Project;

  createSourceFile(relPath: string, text?: string): SourceFile;
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

export const createTSProjectContext = (args: ArgumentsCamelCase<Params>): TSProjectContext => {
  return {
    ...createContext(args),
    project: new Project({
      tsConfigFilePath: path.join(args.output, 'tsconfig.json'),
    }),
    createSourceFile(relPath: string, text = ''): SourceFile {
      return this.project.createSourceFile(path.join(this.outputPath, relPath), text, {
        overwrite: true,
      });
    },
  };
};

import path from 'path';

import { OpenAPIModel, OpenAPIReader } from '@fresha/openapi-model/build/3.0.3';
import { Project, SourceFile } from 'ts-morph';

import { createConsole, createLogger, Logger } from './logging';

type CreateContextParams = {
  input: string;
  output: string;
  jsonApi?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
};

export interface Context {
  readonly openapi: OpenAPIModel;
  readonly outputPath: string;
  readonly useJsonApi: boolean;
  readonly dryRun: boolean;
  readonly logger: Logger;
  readonly console: Console;
}

export const createContext = (args: CreateContextParams): Context => {
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

export interface TSProjectContext extends Context {
  readonly project: Project;

  createSourceFile(relPath: string, text?: string): SourceFile;
}

export const createTSProjectContext = (args: CreateContextParams): TSProjectContext => {
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

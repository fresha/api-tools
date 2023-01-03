import path from 'path';

import {
  Context,
  createConsole,
  createLogger,
  TSProjectContext,
} from '@fresha/openapi-codegen-utils';
import { Project, SourceFile } from 'ts-morph';

import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export const createTestContext = (openapi: OpenAPIModel, outputPath = '/'): Context => {
  const console = createConsole(false);
  console.log = jest.fn();

  return {
    outputPath,
    openapi,
    console,
    logger: createLogger(false),
    dryRun: true,
    useJsonApi: true,
  };
};

export const createTSProjectTestContext = (
  openapi: OpenAPIModel,
  outputPath = '/',
): TSProjectContext => {
  const base = createTestContext(openapi, outputPath);
  const project = new Project({ useInMemoryFileSystem: true });

  return {
    ...base,
    project,
    createSourceFile(relPath: string, text = ''): SourceFile {
      return this.project.createSourceFile(path.join(this.outputPath, relPath), text, {
        overwrite: true,
      });
    },
  };
};

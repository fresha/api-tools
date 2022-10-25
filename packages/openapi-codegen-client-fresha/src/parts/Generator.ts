import path from 'path';

import { getAPIName, getRootUrlOrThrow, Logger } from '@fresha/openapi-codegen-utils';
import { Project, SourceFile } from 'ts-morph';

import { ActionsSignatures } from './ActionsSignatures';
import { APIConfig } from './APIConfig';
import { TestFile } from './TestFile';

import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

type GeneratorOptions = {
  outputPath: string;
  useJsonApi: boolean;
  dryRun: boolean;
};

type APIRootURL = string;

/**
 * Root generator. It doesn't generate the code itself, instead delegating work to its parts.
 */
export class Generator {
  readonly openapi: OpenAPIModel;
  readonly options: GeneratorOptions;
  readonly tsProject: Project;
  readonly tsSourceFile: SourceFile;
  readonly logger: Logger;
  readonly apiName: string;
  readonly apiRootUrl: APIRootURL;
  protected apiConfig: APIConfig;
  protected actionsSignatures: ActionsSignatures;
  protected testFile: TestFile;

  constructor(
    openapi: OpenAPIModel,
    tsProject: Project,
    options: GeneratorOptions,
    logger: Logger,
  ) {
    this.openapi = openapi;
    this.options = options;
    this.tsProject = tsProject;
    this.tsSourceFile = this.tsProject.createSourceFile(
      path.join(this.options.outputPath, 'src', 'index.ts'),
      '',
      { overwrite: true },
    );
    this.logger = logger;
    this.apiName = getAPIName(this.openapi);

    try {
      this.apiRootUrl = getRootUrlOrThrow(this.openapi);
    } catch (err) {
      const message = (err as Record<string, unknown>)?.message;
      if (typeof message === 'string') {
        this.logger.info(message);
      } else {
        this.logger.info(err);
      }
      this.apiRootUrl = 'API_URL';
    }

    this.apiConfig = new APIConfig(this);
    this.actionsSignatures = new ActionsSignatures(this);
    this.testFile = new TestFile(this);
  }

  collectData(): void {
    this.apiConfig.collectData();
    this.actionsSignatures.collectData();
    this.testFile.collectData();
  }

  generateCode(): void {
    this.apiConfig.generateCode();
    this.actionsSignatures.generateCode();
    this.testFile.generateCode();

    if (!this.options.dryRun) {
      this.tsProject.saveSync();
    }
  }
}

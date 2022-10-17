import path from 'path';

import { Project, SourceFile } from 'ts-morph';

import { APIConfig, ActionsSignatures } from './parts';
import { getAPIName } from './utils/openapi';

import type { Logger } from './utils/logging';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

type GeneratorOptions = {
  outputPath: string;
  useJsonApi: boolean;
  dryRun: boolean;
};

export class Generator {
  readonly openapi: OpenAPIModel;
  readonly options: GeneratorOptions;
  protected readonly tsProject: Project;
  readonly tsSourceFile: SourceFile;
  readonly logger: Logger;
  readonly apiName: string;
  protected apiConfig: APIConfig;
  protected actionsSignatures: ActionsSignatures;

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
    this.apiConfig = new APIConfig(this);
    this.actionsSignatures = new ActionsSignatures(this);
  }

  collectData(): void {
    this.apiConfig.collectData();
    this.actionsSignatures.collectData();
  }

  generateCode(): void {
    this.apiConfig.generateCode();
    this.actionsSignatures.generateCode();

    if (!this.options.dryRun) {
      this.tsProject.saveSync();
    }
  }
}

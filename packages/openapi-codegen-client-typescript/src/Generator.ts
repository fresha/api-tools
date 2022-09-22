import console from 'console';

import { Project } from 'ts-morph';

import type { OpenAPIModel, PathItemModel } from '@fresha/openapi-model/build/3.0.3';

type GeneratorOptions = {
  outputPath: string;
  useJsonApi: boolean;
  verbose: boolean;
  dryRun: boolean;
};

export class Generator {
  readonly openapi: OpenAPIModel;
  readonly options: GeneratorOptions;
  protected readonly tsProject: Project;

  constructor(openapi: OpenAPIModel, tsProject: Project, options: GeneratorOptions) {
    this.openapi = openapi;
    this.options = options;
    this.tsProject = tsProject;
  }

  run(): void {
    for (const [pathUrl, pathItem] of this.openapi.paths) {
      this.processPathItem(pathUrl, pathItem);
    }
  }

  protected processPathItem(pathUrl: string, pathItem: PathItemModel): void {
    console.log(pathUrl, pathItem, !!this);
  }
}

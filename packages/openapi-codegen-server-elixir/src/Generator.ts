import { Controller } from './Controller';
import { Resource } from './Resource';
import { Router } from './Router';

import type { OpenAPIModel, PathItemModel } from '@fresha/openapi-model/build/3.0.3';

type GeneratorOptions = {
  outputPath: string;
  phoenixApp: string;
  useJsonApi: boolean;
  verbose: boolean;
  dryRun: boolean;
};

export class Generator {
  readonly openapi: OpenAPIModel;
  readonly options: GeneratorOptions;
  private readonly controllers: Map<string, Controller>;
  private readonly router: Router;
  private readonly resources: Map<string, Resource>;

  constructor(openapi: OpenAPIModel, options: GeneratorOptions) {
    this.openapi = openapi;
    this.options = options;
    this.controllers = new Map<string, Controller>();
    this.router = new Router(this);
    this.resources = new Map<string, Resource>();
  }

  run(): void {
    for (const [pathUrl, pathItem] of this.openapi.paths) {
      this.processPathItem(pathUrl, pathItem);
    }
    for (const controller of this.controllers.values()) {
      this.router.processController(controller);
    }

    for (const controller of this.controllers.values()) {
      controller.generateCode();
    }
    for (const resource of this.resources.values()) {
      resource.generateCode();
    }
    this.router.generateCode();
  }

  protected processPathItem(pathUrl: string, pathItem: PathItemModel): void {
    const moduleName = Controller.makeModuleName(pathUrl);
    let controller = this.controllers.get(moduleName);
    if (!controller) {
      controller = new Controller(this);
      this.controllers.set(moduleName, controller);
    }
    controller.processPathItem(pathUrl, pathItem);
  }
}

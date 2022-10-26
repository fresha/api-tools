import { Controller } from './Controller';
import { ControllerTest } from './ControllerTest';
import { Resource } from './Resource';
import { Router } from './Router';

import type { Logger } from '@fresha/openapi-codegen-utils';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

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
  readonly logger: Logger;
  private readonly controllers: Map<string, Controller>;
  private readonly controllerTests: Map<string, ControllerTest>;
  private readonly router: Router;
  private readonly resources: Map<string, Resource>;

  constructor(openapi: OpenAPIModel, options: GeneratorOptions, logger: Logger) {
    this.openapi = openapi;
    this.options = options;
    this.logger = logger;
    this.controllers = new Map<string, Controller>();
    this.controllerTests = new Map<string, ControllerTest>();
    this.router = new Router(this);
    this.resources = new Map<string, Resource>();
  }

  collectData(): void {
    this.logger.info('Collecting data');

    for (const [pathUrl, pathItem] of this.openapi.paths) {
      const moduleName = Controller.makeModuleName(pathUrl);
      let controller = this.controllers.get(moduleName);
      if (!controller) {
        controller = new Controller(this);
        this.controllers.set(moduleName, controller);
      }
      controller.collectData(pathUrl, pathItem);
    }
    for (const controller of this.controllers.values()) {
      const controllerTest = new ControllerTest(this);

      this.router.processController(controller);
    }
  }

  generateCode(): void {
    this.logger.info('Generating code');

    for (const controller of this.controllers.values()) {
      controller.generateCode();
    }
    for (const resource of this.resources.values()) {
      resource.generateCode();
    }
    this.router.generateCode();
  }
}

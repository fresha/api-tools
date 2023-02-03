import { parseOpenApi } from '@fresha/json-api-model';
import { Generator as GeneratorBase, pathUrlToUrlExp } from '@fresha/openapi-codegen-utils';

import { Controller } from './Controller';
import { ControllerTestSuite } from './ControllerTestSuite';
import { ErrorView } from './ErrorView';
import { FallbackController } from './FallbackController';
import { Resource } from './Resource';
import { ResourceTestSuite } from './ResourceTestSuite';
import { Router } from './Router';
import { View } from './View';
import { ViewTestSuite } from './ViewTestSuite';

import type { Context } from '../context';

export class Generator extends GeneratorBase<Context> {
  protected readonly router: Router;
  protected readonly controllers: Map<string, Controller>;
  protected readonly controllerTests: Map<string, ControllerTestSuite>;
  protected readonly fallbackController: FallbackController;
  protected readonly views: Map<string, View>;
  protected readonly viewTests: Map<string, ViewTestSuite>;
  protected readonly errorView: ErrorView;
  protected readonly resources: Map<string, Resource>;
  protected readonly resourceTests: Map<string, ResourceTestSuite>;

  constructor(context: Context) {
    super(context);
    this.router = new Router(this.context);
    this.controllers = new Map<string, Controller>();
    this.controllerTests = new Map<string, ControllerTestSuite>();
    this.fallbackController = new FallbackController(
      this.context,
      `${this.context.project.appModuleNamePrefix}.FallbackController`,
    );
    this.views = new Map<string, View>();
    this.viewTests = new Map<string, ViewTestSuite>();
    this.errorView = new ErrorView(
      this.context,
      `${this.context.project.appModuleNamePrefix}.ErrorView`,
    );
    this.resources = new Map<string, Resource>();
    this.resourceTests = new Map<string, ResourceTestSuite>();
  }

  protected collectData(): void {
    this.collectResources();
    this.collectResourceTests();
    this.collectControllers();
    this.collectControllerTests();
    this.collectViews();
    this.collectViewTests();
    this.collectRoutes();
  }

  protected collectResources(): void {
    parseOpenApi(this.context.openapi, this.context.registry);

    this.context.logger.info(
      `Found ${this.context.registry.getDocumentIds().length} documents and ${
        this.context.registry.getResourceTypes().length
      } resources`,
    );

    for (const resourceType of this.context.registry.getResourceTypes()) {
      const resourceGen = new Resource(
        this.context,
        this.context.project.getResourceModuleName(resourceType),
        this.context.registry.getResourceSchemaOrThrow(resourceType),
      );
      this.resources.set(resourceType, resourceGen);
    }
  }

  protected collectResourceTests(): void {
    for (const resource of this.resources.values()) {
      const testSuite = new ResourceTestSuite(
        this.context,
        `${resource.moduleName}Test`,
        resource.moduleName,
        resource.resource,
      );
      this.resourceTests.set(testSuite.moduleName, testSuite);
    }
  }

  protected collectControllers(): void {
    for (const [pathUrl, pathItem] of this.context.openapi.paths) {
      const controllerModuleName = this.context.project.getControllerModuleName(pathUrl);
      let controller = this.controllers.get(controllerModuleName);
      if (!controller) {
        controller = new Controller(this.context, pathUrlToUrlExp(pathUrl), controllerModuleName);
        this.controllers.set(controllerModuleName, controller);
      }
      controller.collectData(pathItem);
    }
  }

  protected collectControllerTests(): void {
    for (const [controllerName, controller] of this.controllers) {
      const testSuite = new ControllerTestSuite(this.context, `${controller.moduleName}Test`);
      this.controllerTests.set(controllerName, testSuite);
      testSuite.collectData(controller);
    }
  }

  protected collectViews(): void {
    for (const controller of this.controllers.values()) {
      const viewModuleName = this.context.project.getViewModuleName(controller.moduleName);
      let view = this.views.get(viewModuleName);
      if (!view) {
        view = new View(this.context, viewModuleName);
        this.views.set(viewModuleName, view);
      }
      view.collectData(controller);
    }
  }

  protected collectViewTests(): void {
    for (const [viewName, view] of this.views) {
      const testSuite = new ViewTestSuite(this.context, `${view.moduleName}Test`);
      this.viewTests.set(viewName, testSuite);
      testSuite.collectData(view);
    }
  }

  protected collectRoutes(): void {
    for (const controller of this.controllers.values()) {
      if (controller instanceof Controller) {
        this.router.collectData(controller);
      }
    }
  }

  protected generateCode(): void {
    for (const resource of this.resources.values()) {
      resource.generateCode();
    }
    for (const testSuite of this.resourceTests.values()) {
      testSuite.generateCode();
    }

    for (const controller of this.controllers.values()) {
      controller.generateCode();
    }
    for (const testSuite of this.controllerTests.values()) {
      testSuite.generateCode();
    }

    this.fallbackController.generateCode();

    for (const view of this.views.values()) {
      view.generateCode();
    }
    for (const testSuite of this.viewTests.values()) {
      testSuite.generateCode();
    }

    this.errorView.generateCode();

    this.router.generateCode();

    if (!this.context.dryRun) {
      this.context.project.saveSync();
    }
  }
}

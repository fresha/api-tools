import assert from 'assert';
import path from 'path';

import { Controller } from './Controller';
import { DTO } from './DTO';
import { Module } from './Module';

import type { Nullable } from '@fresha/api-tools-core';
import type { OpenAPIModel, PathItemModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';
import type { Project } from 'ts-morph';

type GeneratorOptions = {
  outputPath: string;
  nestApp: string;
  useJsonApi: boolean;
  verbose: boolean;
  dryRun: boolean;
};

export class Generator {
  readonly openapi: OpenAPIModel;
  readonly tsProject: Project;
  protected readonly options: GeneratorOptions;
  protected readonly controllers: Map<string, Controller>;
  protected readonly dtos: Map<string, DTO>;
  protected readonly module: Module;

  constructor(openapi: OpenAPIModel, tsProject: Project, options: GeneratorOptions) {
    this.openapi = openapi;
    this.options = options;
    this.tsProject = tsProject;
    this.controllers = new Map<string, Controller>();
    this.dtos = new Map<string, DTO>();
    this.module = new Module(this);
  }

  get outputPath(): string {
    return this.options.outputPath;
  }

  get nestApp(): string {
    return this.options.nestApp;
  }

  getDTO(name: string): DTO | undefined {
    return this.dtos.get(name);
  }

  addDTO(name: string, schema: Nullable<SchemaModel>): DTO {
    assert(!this.dtos.has(name));
    const result = new DTO(this, name, schema);
    this.dtos.set(name, result);
    return result;
  }

  run(): void {
    for (const [pathUrl, pathItem] of this.openapi.paths) {
      this.processPathItem(pathUrl, pathItem);
    }
    for (const controller of this.controllers.values()) {
      this.module.processController(controller);
    }

    for (const controller of this.controllers.values()) {
      controller.generateCode();
    }
    this.module.generateCode();
    for (const dto of this.dtos.values()) {
      dto.generateCode();
    }

    if (!this.options.dryRun) {
      this.tsProject.saveSync();
    }
  }

  protected processPathItem(pathUrl: string, pathItem: PathItemModel): void {
    const className = Controller.makeClassName(pathUrl);
    let controller = this.controllers.get(className);
    if (!controller) {
      controller = new Controller(
        this,
        path.join(this.options.outputPath, Controller.makeFileName(pathUrl)),
        className,
      );
      this.controllers.set(className, controller);
    }
    controller.processPathItem(pathUrl, pathItem);
  }
}

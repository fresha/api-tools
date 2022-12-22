import assert from 'assert';
import path from 'path';

import { Generator as GeneratorBase } from '@fresha/openapi-codegen-utils';

import { Controller } from './Controller';
import { DTO } from './DTO';
import { Module } from './Module';

import type { Context } from './types';
import type { Nullable } from '@fresha/api-tools-core';
import type { PathItemModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class Generator extends GeneratorBase<Context> {
  protected readonly controllers: Map<string, Controller>;
  protected readonly dtos: Map<string, DTO>;
  protected readonly module: Module;

  constructor(context: Context) {
    super(context);
    this.controllers = new Map<string, Controller>();
    this.dtos = new Map<string, DTO>();
    this.module = new Module(this.context);
  }

  get outputPath(): string {
    return this.context.outputPath;
  }

  get nestApp(): string {
    return this.context.nestApp;
  }

  getDTO(name: string): DTO | undefined {
    return this.dtos.get(name);
  }

  addDTO(name: string, schema: Nullable<SchemaModel>): DTO {
    assert(!this.dtos.has(name));
    const result = new DTO(this.context, name, schema);
    this.dtos.set(name, result);
    return result;
  }

  protected collectData(): void {
    for (const [pathUrl, pathItem] of this.context.openapi.paths) {
      this.processPathItem(pathUrl, pathItem);
    }
    for (const controller of this.controllers.values()) {
      this.module.processController(controller);
    }
  }

  protected processPathItem(pathUrl: string, pathItem: PathItemModel): void {
    this.context.logger.info(`Processing '${pathUrl}' item`);

    const className = Controller.makeClassName(pathUrl);
    let controller = this.controllers.get(className);
    if (!controller) {
      controller = new Controller(
        this.context,
        path.join(this.context.outputPath, Controller.makeFileName(pathUrl)),
        className,
      );
      this.controllers.set(className, controller);
    }
    controller.processPathItem(pathUrl, pathItem);
  }

  generateCode(): void {
    for (const controller of this.controllers.values()) {
      controller.generateCode();
    }
    this.module.generateCode();
    for (const dto of this.dtos.values()) {
      dto.generateCode();
    }
    if (!this.context.dryRun) {
      this.context.logger.info('Saving changes');
      this.context.project.saveSync();
    }
  }
}

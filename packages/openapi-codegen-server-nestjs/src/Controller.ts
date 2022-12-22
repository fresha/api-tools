import path from 'path';

import { titleCase } from '@fresha/api-tools-core';
import {
  addDecorator,
  commonStringPrefix,
  kebabCase,
  significantNameParts,
  addImportDeclaration,
} from '@fresha/openapi-codegen-utils';

import { Action } from './Action';

import type { Context } from './types';
import type { PathItemModel } from '@fresha/openapi-model/build/3.0.3';
import type { SourceFile } from 'ts-morph';

/**
 * Generates code for a single NestJS controller.
 */
export class Controller {
  /**
   * Given OpenAPI path item URL, returns controller class name.
   */
  static makeClassName(pathUrl: string): string {
    const nameParts = significantNameParts(pathUrl);
    return titleCase(nameParts.concat('Controller').join('-')).replace(/\s+/g, '');
  }

  /**
   * Given an OpenAPI path item URL, returns controller file name.
   */
  static makeFileName(pathUrl: string): string {
    const nameParts = significantNameParts(pathUrl);
    if (nameParts.length) {
      return `${kebabCase(nameParts.join('-'))}.controller.ts`;
    }
    return 'controller.ts';
  }

  readonly context: Context;
  readonly className: string;
  readonly outputPath: string;
  protected readonly sourceFile: SourceFile;
  protected readonly actions: Action[];
  protected urlPrefix: string | null;

  constructor(context: Context, outputPath: string, className: string) {
    this.context = context;
    this.outputPath = outputPath;
    this.className = className;
    this.sourceFile = this.context.project.createSourceFile(this.outputPath, '', {
      overwrite: true,
    });
    this.actions = [];
    this.urlPrefix = null;
  }

  relativeModulePath(filePath: string): string {
    return `./${path.relative(
      path.dirname(this.outputPath),
      path.join(path.dirname(filePath), path.basename(filePath, '.ts')),
    )}`;
  }

  processPathItem(pathUrl: string, pathItem: PathItemModel): void {
    for (const [methodName, operation] of pathItem.operations()) {
      this.actions.push(new Action(this.context, this, pathUrl, methodName, operation));
    }
    this.urlPrefix = null;
  }

  getUrlPrefix(): string {
    if (this.urlPrefix == null) {
      this.urlPrefix = commonStringPrefix(this.actions.map(action => action.pathUrl));
    }
    return this.urlPrefix;
  }

  generateCode(): void {
    this.context.logger.info(`Generating controller code for ${this.outputPath}`);

    addImportDeclaration(this.sourceFile, '@nestjs/common', 'Controller');

    const classDecl = this.sourceFile.addClass({
      name: this.className,
      isExported: true,
    });

    addDecorator(classDecl, 'Controller', this.getUrlPrefix());

    for (const action of this.actions) {
      action.generateCode(classDecl);
    }
  }
}

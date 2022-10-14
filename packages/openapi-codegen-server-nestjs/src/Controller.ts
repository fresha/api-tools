import path from 'path';

import { Action } from './Action';
import {
  addCommonNestImports,
  addDecorator,
  commonStringPrefix,
  kebabCase,
  significantNameParts,
  startCase,
} from './utils';

import type { Generator } from './Generator';
import type { Logger } from './utils/logging';
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
    return startCase(nameParts.concat('Controller').join('-')).replace(/\s+/g, '');
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

  readonly generator: Generator;
  readonly className: string;
  readonly outputPath: string;
  protected readonly tsSourceFile: SourceFile;
  protected readonly actions: Action[];
  protected urlPrefix: string | null;
  protected readonly logger: Logger;

  constructor(generator: Generator, outputPath: string, className: string, logger: Logger) {
    this.generator = generator;
    this.outputPath = outputPath;
    this.className = className;
    this.tsSourceFile = this.generator.tsProject.createSourceFile(this.outputPath, '', {
      overwrite: true,
    });
    this.actions = [];
    this.urlPrefix = null;
    this.logger = logger;
  }

  relativeModulePath(filePath: string): string {
    return `./${path.relative(
      path.dirname(this.outputPath),
      path.join(path.dirname(filePath), path.basename(filePath, '.ts')),
    )}`;
  }

  processPathItem(pathUrl: string, pathItem: PathItemModel): void {
    for (const [methodName, operation] of pathItem.operations()) {
      this.actions.push(new Action(this, pathUrl, methodName, operation, this.logger));
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
    this.logger.info(`Generating controller code for ${this.outputPath}`);

    addCommonNestImports(this.tsSourceFile, 'Controller');

    const classDecl = this.tsSourceFile.addClass({
      name: this.className,
      isExported: true,
    });

    addDecorator(classDecl, 'Controller', this.getUrlPrefix());

    for (const action of this.actions) {
      action.generateCode(classDecl);
    }
  }
}

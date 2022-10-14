import assert from 'assert';
import path from 'path';

import { SourceFile, SyntaxKind } from 'ts-morph';

import { addNamedImport } from './utils';

import type { Controller } from './Controller';
import type { Generator } from './Generator';
import type { Logger } from './utils/logging';

type ModuleName = string;
type NamedImport = string;

export class Module {
  readonly generator: Generator;
  readonly outputPath: string;
  private readonly controllerImports: Map<ModuleName, NamedImport>;
  private readonly tsSourceFile: SourceFile;
  protected readonly logger: Logger;

  constructor(generator: Generator, logger: Logger) {
    this.generator = generator;
    this.outputPath = path.join(this.generator.outputPath, `${this.generator.nestApp}.module.ts`);
    this.controllerImports = new Map<ModuleName, NamedImport>();
    this.tsSourceFile = this.generator.tsProject.getSourceFileOrThrow(this.outputPath);
    this.logger = logger;
  }

  processController(controller: Controller): void {
    const moduleName = `./${path.basename(controller.outputPath, '.ts')}`;
    assert(
      [undefined, moduleName].includes(this.controllerImports.get(controller.className)),
      `Duplicate import ${controller.className} from module '${moduleName}'`,
    );
    this.controllerImports.set(moduleName, controller.className);
  }

  generateCode(): void {
    this.logger.info(`Generating code for module file ${this.outputPath}`);

    const moduleClassDecl = this.tsSourceFile.getClasses().at(0);
    assert(moduleClassDecl);

    const decoratorArgument = moduleClassDecl
      .getDecorator('Module')
      ?.getNodeProperty('expression')
      .asKindOrThrow(SyntaxKind.CallExpression)
      .getNodeProperty('arguments')?.[0]
      .asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    assert(decoratorArgument);

    addNamedImport(this.tsSourceFile, '@nestjs/core', 'APP_PIPE');
    addNamedImport(this.tsSourceFile, '@nestjs/common', 'ValidationPipe');
    const providersProp = decoratorArgument
      .getPropertyOrThrow('providers')
      .asKindOrThrow(SyntaxKind.PropertyAssignment)
      .getNodeProperty('initializer')
      .asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    if (!this.tsSourceFile.getText().includes('provide: APP_PIPE')) {
      providersProp.addElement(`{
        provide: APP_PIPE,
        useClass: ValidationPipe,
      }`);
    }

    for (const [moduleName, controllerName] of this.controllerImports) {
      this.tsSourceFile.addImportDeclaration({
        moduleSpecifier: moduleName,
        namedImports: [{ name: controllerName }],
      });
    }

    const prop = decoratorArgument
      .getPropertyOrThrow('controllers')
      .asKindOrThrow(SyntaxKind.PropertyAssignment)
      .getNodeProperty('initializer')
      .asKindOrThrow(SyntaxKind.ArrayLiteralExpression);

    if (prop) {
      for (const controllerName of this.controllerImports.values()) {
        prop.addElement(controllerName);
      }
    }
  }
}

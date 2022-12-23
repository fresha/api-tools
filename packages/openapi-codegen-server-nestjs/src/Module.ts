import assert from 'assert';
import path from 'path';

import { addImportDeclaration } from '@fresha/code-morph-ts';
import { SourceFile, SyntaxKind } from 'ts-morph';

import type { Controller } from './Controller';
import type { Context } from './types';

type ModuleName = string;
type NamedImport = string;

export class Module {
  readonly context: Context;
  readonly outputPath: string;
  private readonly controllerImports: Map<ModuleName, NamedImport>;
  private readonly sourceFile: SourceFile;

  constructor(context: Context) {
    this.context = context;
    this.outputPath = path.join(this.context.outputPath, `${this.context.nestApp}.module.ts`);
    this.controllerImports = new Map<ModuleName, NamedImport>();
    this.sourceFile = this.context.project.getSourceFileOrThrow(this.outputPath);
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
    this.context.logger.info(`Generating code for module file ${this.outputPath}`);

    const moduleClassDecl = this.sourceFile.getClasses().at(0);
    assert(moduleClassDecl);

    const decoratorArgument = moduleClassDecl
      .getDecorator('Module')
      ?.getNodeProperty('expression')
      .asKindOrThrow(SyntaxKind.CallExpression)
      .getNodeProperty('arguments')?.[0]
      .asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    assert(decoratorArgument);

    addImportDeclaration(this.sourceFile, '@nestjs/core', 'APP_PIPE');
    addImportDeclaration(this.sourceFile, '@nestjs/common', 'ValidationPipe');
    const providersProp = decoratorArgument
      .getPropertyOrThrow('providers')
      .asKindOrThrow(SyntaxKind.PropertyAssignment)
      .getNodeProperty('initializer')
      .asKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    if (!this.sourceFile.getText().includes('provide: APP_PIPE')) {
      providersProp.addElement(`{
        provide: APP_PIPE,
        useClass: ValidationPipe,
      }`);
    }

    for (const [moduleName, controllerName] of this.controllerImports) {
      this.sourceFile.addImportDeclaration({
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

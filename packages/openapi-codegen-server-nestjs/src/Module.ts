import assert from 'assert';
import path from 'path';

import { SourceFile, SyntaxKind } from 'ts-morph';

import type { Controller } from './Controller';
import type { Generator } from './Generator';

type ModuleName = string;
type NamedImport = string;

export class Module {
  /**
   * Given name of a NestJS sub-app, returns file name of a module file for that sub-app.
   */
  static makeFileName(nestAppName: string): string {
    return `${nestAppName}.module.ts`;
  }

  readonly generator: Generator;
  readonly outputPath: string;
  private readonly tsSourceFile: SourceFile;
  private readonly controllerImports: Map<ModuleName, NamedImport>;

  constructor(generator: Generator, outputPath: string) {
    this.generator = generator;
    this.outputPath = outputPath;
    this.controllerImports = new Map<ModuleName, NamedImport>();

    const sourceFile = this.generator.tsProject.getSourceFile(this.outputPath);
    assert(sourceFile, `Cannot find module file ${this.outputPath}`);
    this.tsSourceFile = sourceFile;
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
    for (const [moduleName, controllerName] of this.controllerImports) {
      this.tsSourceFile.addImportDeclaration({
        moduleSpecifier: moduleName,
        namedImports: [{ name: controllerName }],
      });
    }

    for (const classDecl of this.tsSourceFile.getClasses()) {
      const prop = classDecl
        .getDecorator('Module')
        ?.getNodeProperty('expression')
        .asKindOrThrow(SyntaxKind.CallExpression)
        .getNodeProperty('arguments')?.[0]
        .asKindOrThrow(SyntaxKind.ObjectLiteralExpression)
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
}
import assert from 'assert';
import path from 'path';

import { snakeCase, titleCase } from '@fresha/api-tools-core';

import { SourceFile } from './SourceFile';
import { createFileSystem, significantNameParts, FS } from './utils';

export type ProjectOptions = {
  rootDir: string;
  phoenixApp: string;
  useInMemoryFileSystem?: boolean;
  overwriteFiles?: boolean;
};

/**
 * This class knows about structure and naming conventions of Elixir / Phoenix projects.
 */
export class Project {
  readonly rootDir: string;
  readonly appName: string;
  readonly appModuleNamePrefix: string;
  protected appNameSnakeCase: string;
  protected readonly fs: FS;
  protected readonly sourceFiles: Map<string, SourceFile>;
  protected readonly overwriteFiles: boolean;

  constructor(options: ProjectOptions) {
    this.rootDir = options.rootDir;
    this.fs = createFileSystem(!!options.useInMemoryFileSystem);
    this.appName = options.phoenixApp;
    this.appModuleNamePrefix = titleCase(this.appName);
    this.appNameSnakeCase = snakeCase(this.appName);
    this.sourceFiles = new Map<string, SourceFile>();
    this.overwriteFiles = !!options.overwriteFiles;
  }

  getFS(): FS {
    return this.fs;
  }

  getSourceFile(filePath: string): SourceFile | undefined {
    let result = this.sourceFiles.get(filePath);
    if (!result && this.fs.existsSync(filePath)) {
      const content = this.fs.readFileSync(filePath, 'utf-8');
      result = new SourceFile(this, filePath, content.toString());
      this.sourceFiles.set(filePath, result);
    }
    return result;
  }

  getSourceFileOrThrow(filePath: string): SourceFile {
    const result = this.getSourceFile(filePath);
    assert(result, `Expect file "${filePath}" to exist`);
    return result;
  }

  createSourceFile(filePath: string, content?: string): SourceFile {
    assert(this.overwriteFiles || !this.sourceFiles.has(filePath));
    const result = new SourceFile(this, filePath, content);
    this.sourceFiles.set(filePath, result);
    return result;
  }

  // Elixir-specific

  getAppModuleName(): string {
    return this.appModuleNamePrefix;
  }

  getModuleName(name: string): string {
    return `${this.appModuleNamePrefix}.${name}`;
  }

  // Phoenix-specific

  getRouterFilePath(): string {
    return path.join(this.rootDir, 'lib', snakeCase(this.appName), 'router.ex');
  }

  getRouterFile(): SourceFile | undefined {
    const filePath = this.getRouterFilePath();
    return this.getSourceFile(filePath);
  }

  getRouterFileOrThrow(): SourceFile {
    const result = this.getRouterFile();
    assert(result, `Expect router file to exist`);
    return result;
  }

  getControllerModuleName(pathUrl: string): string {
    const nameParts = significantNameParts(pathUrl);
    const nameSuffix = titleCase(nameParts.concat('Controller').join('-')).replace(/\s+/g, '');
    return `${this.appModuleNamePrefix}.${nameSuffix}`;
  }

  getControllerFilePath(controllerName: string): string {
    const parts = controllerName.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.ex`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(this.rootDir, 'lib', this.appNameSnakeCase, 'controllers', ...parts, fileName);
  }

  getControllerFile(controllerName: string): SourceFile | undefined {
    const filePath = this.getControllerFilePath(controllerName);
    return this.getSourceFile(filePath);
  }

  getControllerFileOrThrow(controllerName: string): SourceFile {
    const result = this.getControllerFile(controllerName);
    assert(result);
    return result;
  }

  createControllerFile(controllerName: string): SourceFile {
    assert(
      this.overwriteFiles || !this.getControllerFile(controllerName),
      `Didn't expect "${controllerName}" controller source file to exist`,
    );
    const filePath = this.getControllerFilePath(controllerName);
    return this.createSourceFile(filePath);
  }

  getControllerTestFilePath(controllerName: string): string {
    const parts = controllerName.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.exs`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(
      this.rootDir,
      'test',
      this.appNameSnakeCase,
      'controllers',
      ...parts,
      fileName,
    );
  }

  getControllerTestFile(controllerName: string): SourceFile | undefined {
    const filePath = this.getControllerTestFilePath(controllerName);
    return this.getSourceFile(filePath);
  }

  getControllerTestFileOrThrow(controllerName: string): SourceFile {
    const result = this.getControllerTestFile(controllerName);
    assert(result, `Expect test file for controller "${controllerName}" exists`);
    return result;
  }

  createControllerTestFile(controllerName: string): SourceFile {
    assert(
      this.overwriteFiles || !this.getControllerTestFile(controllerName),
      `Didn't expect "${controllerName}" controller test file to exist`,
    );
    const filePath = this.getControllerTestFilePath(controllerName);
    return this.createSourceFile(filePath);
  }

  // eslint-disable-next-line class-methods-use-this
  getViewModuleName(controllerModuleName: string): string {
    return controllerModuleName.replace(/Controller$/, 'View');
  }

  getViewFilePath(viewName: string): string {
    const parts = viewName.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.ex`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(this.rootDir, 'lib', this.appNameSnakeCase, 'views', ...parts, fileName);
  }

  getViewFile(viewName: string): SourceFile | undefined {
    const filePath = this.getViewFilePath(viewName);
    return this.getSourceFile(filePath);
  }

  getViewFileOrThrow(viewName: string): SourceFile {
    const result = this.getViewFile(viewName);
    assert(result, `Expect view file "${viewName}" exist`);
    return result;
  }

  createViewFile(viewName: string): SourceFile {
    assert(
      this.overwriteFiles || !this.getViewFile(viewName),
      `Didn't expect "${viewName}" view source file to exist`,
    );
    const filePath = this.getViewFilePath(viewName);
    return this.createSourceFile(filePath);
  }

  getViewTestFilePath(viewName: string): string {
    const parts = viewName.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.exs`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(this.rootDir, 'test', this.appNameSnakeCase, 'views', ...parts, fileName);
  }

  getViewTestFile(viewName: string): SourceFile | undefined {
    const filePath = this.getViewTestFilePath(viewName);
    return this.getSourceFile(filePath);
  }

  getViewTestFileOrThrow(viewName: string): SourceFile {
    const result = this.getViewTestFile(viewName);
    assert(result, `Expect test file for view "${viewName}" exists`);
    return result;
  }

  createViewTestFile(viewName: string): SourceFile {
    assert(
      this.overwriteFiles || !this.getViewTestFile(viewName),
      `Didn't expect "${viewName}" view test file to exist`,
    );
    const filePath = this.getViewTestFilePath(viewName);
    return this.createSourceFile(filePath);
  }

  // specific to JSON:API - based projects

  getResourceModuleName(resourceType: string): string {
    return `${this.appModuleNamePrefix}.${titleCase(resourceType)}Resource`;
  }

  getResourceModuleAlias(resourceType: string): string {
    const result = this.getResourceModuleName(resourceType).split('.').at(-1);
    assert(result);
    return result;
  }

  getResourceFilePath(resourceName: string): string {
    const parts = resourceName.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.ex`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(this.rootDir, 'lib', this.appNameSnakeCase, 'resources', ...parts, fileName);
  }

  getResourceFile(resourceName: string): SourceFile | undefined {
    const filePath = this.getResourceFilePath(resourceName);
    return this.getSourceFile(filePath);
  }

  getResourceFileOrThrow(resourceName: string): SourceFile {
    const result = this.getResourceFile(resourceName);
    assert(result, `Expect resource file "${resourceName}" exist`);
    return result;
  }

  createResourceFile(resourceName: string): SourceFile {
    assert(
      this.overwriteFiles || !this.getResourceFile(resourceName),
      `Didn't expect "${resourceName}" resource file to exist`,
    );
    const filePath = this.getResourceFilePath(resourceName);
    return this.createSourceFile(filePath);
  }

  getResourceTestFilePath(resourceName: string): string {
    const parts = resourceName.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.exs`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(this.rootDir, 'test', this.appNameSnakeCase, 'resources', ...parts, fileName);
  }

  getResourceTestFile(resourceName: string): SourceFile | undefined {
    const filePath = this.getResourceTestFilePath(resourceName);
    return this.getSourceFile(filePath);
  }

  getResourceTestFileOrThrow(resourceName: string): SourceFile {
    const result = this.getResourceTestFile(resourceName);
    assert(result, `Expect test file for resource "${resourceName}" exists`);
    return result;
  }

  createResourceTestFile(resourceName: string): SourceFile {
    assert(
      this.overwriteFiles || !this.getResourceTestFile(resourceName),
      `Didn't expect "${resourceName}" resource test file to exist`,
    );
    const filePath = this.getResourceTestFilePath(resourceName);
    return this.createSourceFile(filePath);
  }

  saveSync(): void {
    for (const sourceFile of this.sourceFiles.values()) {
      sourceFile.saveSync();
    }
  }
}

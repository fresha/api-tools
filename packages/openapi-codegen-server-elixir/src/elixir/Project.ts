import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { snakeCase } from '@fresha/openapi-codegen-utils';
import { fs as memfs } from 'memfs';

import { SourceFile } from './SourceFile';

type FS = typeof fs | typeof memfs;

export type ProjectOptions = {
  rootDir: string;
  appName: string;
  useInMemoryFileSystem?: boolean;
};

export class Project {
  readonly rootDir: string;
  readonly appName: string;
  protected appNameSnakeCase: string;
  protected readonly fs: FS;
  protected readonly files: Map<string, SourceFile>;

  constructor(options: ProjectOptions) {
    this.rootDir = options.rootDir;
    this.appName = options.appName;
    this.appNameSnakeCase = snakeCase(this.appName);
    this.fs = options?.useInMemoryFileSystem ? memfs : fs;
    this.files = new Map<string, SourceFile>();
  }

  getFS(): FS {
    return this.fs;
  }

  getSourceFile(filePath: string): SourceFile | undefined {
    let result = this.files.get(filePath);
    if (!result && fs.existsSync(filePath)) {
      result = new SourceFile(this, filePath);
      this.files.set(filePath, result);
    }
    return result;
  }

  getSourceFileOrThrow(filePath: string): SourceFile {
    const result = this.getSourceFile(filePath);
    assert(result, `Expect file "${filePath}" to exist`);
    return result;
  }

  createSourceFile(filePath: string, content: string): SourceFile {
    return new SourceFile(this, filePath, content);
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

  getControllerFilePath(name: string): string {
    const parts = name.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.ex`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    global.console.log(name, this.appNameSnakeCase, parts, fileName);
    return path.join(this.rootDir, 'lib', this.appNameSnakeCase, 'controllers', ...parts, fileName);
  }

  getControllerFile(name: string): SourceFile | undefined {
    const filePath = this.getControllerFilePath(name);
    return this.getSourceFile(filePath);
  }

  getControllerFileOrThrow(name: string): SourceFile {
    const result = this.getControllerFile(name);
    assert(result);
    return result;
  }

  getControllerTestFilePath(name: string): string {
    const parts = name.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.exs`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(this.rootDir, 'test', this.appNameSnakeCase, 'controllers', ...parts, fileName);
  }

  getControllerTestFile(name: string): SourceFile | undefined {
    const filePath = this.getControllerTestFilePath(name);
    return this.getSourceFile(filePath);
  }

  getControllerTestFileOrThrow(name: string): SourceFile {
    const result = this.getControllerTestFile(name);
    assert(result, `Expect test file for controller "${name}" exists`);
    return result;
  }

  getViewFilePath(name: string): string {
    const parts = name.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.ex`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(this.rootDir, 'lib', this.appNameSnakeCase, 'views', ...parts, fileName);
  }

  getViewFile(name: string): SourceFile | undefined {
    const filePath = this.getViewFilePath(name);
    return this.getSourceFile(filePath);
  }

  getViewFileOrThrow(name: string): SourceFile {
    const result = this.getViewFile(name);
    assert(result, `Expect view file "${name}" exist`);
    return result;
  }

  getViewTestFilePath(name: string): string {
    const parts = name.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.exs`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(this.rootDir, 'test', this.appNameSnakeCase, 'views', ...parts, fileName);
  }

  getViewTestFile(name: string): SourceFile | undefined {
    const filePath = this.getViewTestFilePath(name);
    return this.getSourceFile(filePath);
  }

  getViewTestFileOrThrow(name: string): SourceFile {
    const result = this.getViewTestFile(name);
    assert(result, `Expect test file for view "${name}" exists`);
    return result;
  }

  getResourceFilePath(name: string): string {
    const parts = name.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.ex`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(this.rootDir, 'lib', this.appNameSnakeCase, 'resources', ...parts, fileName);
  }

  getResourceFile(name: string): SourceFile | undefined {
    const filePath = this.getResourceFilePath(name);
    return this.getSourceFile(filePath);
  }

  getResourceFileOrThrow(name: string): SourceFile {
    const result = this.getResourceFile(name);
    assert(result, `Expect resource file "${name}" exist`);
    return result;
  }

  getResourceTestFilePath(name: string): string {
    const parts = name.split('.').map(snakeCase);
    const fileName = `${String(parts.pop())}.exs`;
    if (parts[0] === this.appNameSnakeCase) {
      parts.shift();
    }
    return path.join(this.rootDir, 'test', this.appNameSnakeCase, 'resources', ...parts, fileName);
  }

  getResourceTestFile(name: string): SourceFile | undefined {
    const filePath = this.getResourceTestFilePath(name);
    return this.getSourceFile(filePath);
  }

  getResourceTestFileOrThrow(name: string): SourceFile {
    const result = this.getViewTestFile(name);
    assert(result, `Expect test file for resource "${name}" exists`);
    return result;
  }

  saveSync(): void {
    for (const sourceFile of this.files.values()) {
      sourceFile.saveSync();
    }
  }
}

import path from 'path';

import { Context } from '../context';

import type { SourceFile } from 'ts-morph';

export class IndexFile {
  readonly context: Context;
  readonly sourceFile: SourceFile;

  constructor(context: Context) {
    this.context = context;
    this.sourceFile = this.context.project.createSourceFile(
      path.join(this.context.outputPath, 'src', 'index.ts'),
      '',
      { overwrite: true },
    );
  }

  // eslint-disable-next-line class-methods-use-this
  collectData(): void {}

  generateCode(): void {
    this.sourceFile.insertText(
      0,
      `export * from './actions';
      export { init, setAuthCookie } from './utils';
      `,
    );
  }
}

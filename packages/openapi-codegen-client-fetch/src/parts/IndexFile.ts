import type { Context } from '../context';
import type { SourceFile } from 'ts-morph';

export class IndexFile {
  readonly context: Context;
  readonly sourceFile: SourceFile;

  constructor(context: Context) {
    this.context = context;
    this.sourceFile = this.context.createSourceFile('src/index.ts');
  }

  // eslint-disable-next-line class-methods-use-this
  collectData(): void {}

  generateCode(): void {
    this.sourceFile.addStatements(`export * from './types';`);
    this.sourceFile.addStatements(`export * from './actions';`);
    if (this.context.withFormatters) {
      this.sourceFile.addStatements(`export * from './formatters';`);
    }
    this.sourceFile.addStatements(
      `export { init, setAuthCookie, APIClientErrorKind, APIClientError } from './utils';`,
    );
  }
}

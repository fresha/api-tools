import path from 'path';

import { addConstant, addImportDeclarations } from '@fresha/openapi-codegen-utils';
import { CodeBlockWriter, SourceFile } from 'ts-morph';

import type { Context } from './types';

/**
 * Generates file with basic API tests.
 */
export class TestFile {
  readonly context: Context;
  readonly tsSourceFile: SourceFile;

  constructor(context: Context) {
    this.context = context;
    this.tsSourceFile = this.context.project.createSourceFile(
      path.join(this.context.outputPath, 'src', 'index.test.ts'),
      '',
      { overwrite: true },
    );
  }

  // eslint-disable-next-line class-methods-use-this
  collectData(): void {}

  generateCode(): void {
    addImportDeclarations(this.tsSourceFile, {
      '@fresha/connector-utils/build/types/api': 't:APIEntryConfig',
      '@fresha/connector-utils/build/apiConfig/utils': 'generateUrlsMapping',
      './index': 'makeApiConfig',
    });

    addConstant(this.tsSourceFile, this.context.apiRootUrl, "'http://localhost:3000'");

    this.tsSourceFile.addStatements((writer: CodeBlockWriter) => {
      writer.newLine();
      writer.writeLine("describe('init', () => {");
      writer.indent(() => {
        writer.writeLine("it('matches the snapshot', () => {");
        writer.indent(() => {
          writer.writeLine(
            `const [apiConfig, options] = makeApiConfig({ ${this.context.apiRootUrl} });`,
          );
          writer.writeLine('expect(');
          writer.indent(() => {
            writer.writeLine(
              'generateUrlsMapping([(apiConfig as unknown) as APIEntryConfig[], options]),',
            );
          });
          writer.writeLine(').toMatchSnapshot();');
        });
        writer.writeLine('});');
      });
      writer.writeLine('});');
    });
  }
}

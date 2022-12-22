import path from 'path';

import { ActionsSignatures } from './ActionsSignatures';
import { APIConfig } from './APIConfig';
import { TestFile } from './TestFile';

import type { Context } from './types';
import type { SourceFile } from 'ts-morph';

/**
 * Root generator. It doesn't generate the code itself, instead delegating work to its parts.
 */
export class Generator {
  readonly context: Context;
  readonly sourceFile: SourceFile;
  protected apiConfig: APIConfig;
  protected actionsSignatures: ActionsSignatures;
  protected testFile: TestFile;

  constructor(context: Context) {
    this.context = context;
    this.sourceFile = this.context.project.createSourceFile(
      path.join(this.context.outputPath, 'src', 'index.ts'),
      '',
      { overwrite: true },
    );
    this.apiConfig = new APIConfig(this.context, this.sourceFile);
    this.actionsSignatures = new ActionsSignatures(this.context, this.sourceFile);
    this.testFile = new TestFile(this.context);
  }

  run(): void {
    this.collectData();
    this.generateCode();
  }

  protected collectData(): void {
    this.apiConfig.collectData();
    this.actionsSignatures.collectData();
    this.testFile.collectData();
  }

  protected generateCode(): void {
    this.apiConfig.generateCode();
    this.actionsSignatures.generateCode();
    this.testFile.generateCode();

    if (!this.context.dryRun) {
      this.context.project.saveSync();
    }
  }
}

import type { Context } from './types';
import type { View } from './View';
import type { SourceFile } from '@fresha/ex-morph';

export class ViewTestSuite {
  readonly context: Context;
  readonly moduleName: string;
  readonly sourceFile: SourceFile;

  constructor(context: Context, moduleName: string) {
    this.context = context;
    this.moduleName = moduleName;
    this.sourceFile = this.context.project.createViewTestFile(moduleName);
  }

  collectData(view: View): void {
    this.context.logger.info(`Generating code for view tests "${this.moduleName}"`);
    this.context.logger.debug(view);
  }

  generateCode(): void {
    this.context.logger.info(`Generating code for view tests "${this.moduleName}"`);

    this.sourceFile.writeDefmodule(this.moduleName, () => {
      this.sourceFile.writeUse(this.context.project.getModuleName('ConnCase'), 'async: true');
      this.sourceFile.writeUse('Jabbax.Document');
      this.sourceFile.newLine();
    });
  }
}

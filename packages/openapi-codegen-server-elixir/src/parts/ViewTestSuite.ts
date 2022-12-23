import type { Context } from '../context';
import type { View } from './View';
import type { SourceFile } from '@fresha/code-morph-ex';

export class ViewTestSuite {
  readonly context: Context;
  readonly moduleName: string;
  readonly sourceFile: SourceFile;
  readonly actions: string[];

  constructor(context: Context, moduleName: string) {
    this.context = context;
    this.moduleName = moduleName;
    this.sourceFile = this.context.project.createViewTestFile(moduleName);
    this.actions = [];
  }

  collectData(view: View): void {
    this.context.logger.info(`Generating code for view tests "${this.moduleName}"`);

    for (const action of view.actions) {
      this.actions.push(action.getName());
    }
  }

  generateCode(): void {
    this.context.logger.info(`Generating code for view tests "${this.moduleName}"`);

    this.sourceFile.writeDefmodule(this.moduleName, () => {
      this.sourceFile.writeUse(this.context.project.getModuleName('ConnCase'), 'async: true');
      this.sourceFile.writeUse('Jabbax.Document');

      for (const action of this.actions) {
        this.sourceFile.newLine();
        this.sourceFile.writeTestFunction(`renders ${action}.json-api`, () => {
          this.sourceFile.writeLine('# TODO prepare data');
          this.sourceFile.writeLine('# TODO render view');
          this.sourceFile.writeLine('# TODO verify returned data');
        });
      }
    });
  }
}

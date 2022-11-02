import type { Action } from './Action';
import type { Controller } from './Controller';
import type { Context } from './types';
import type { SourceFile } from '@fresha/ex-morph';

export class ControllerTestSuite {
  readonly context: Context;
  readonly moduleName: string;
  protected readonly sourceFile: SourceFile;
  protected readonly actions: Action[];

  constructor(context: Context, moduleName: string) {
    this.context = context;
    this.moduleName = moduleName;
    this.sourceFile = this.context.project.createControllerTestFile(this.moduleName);
    this.actions = [];
  }

  collectData(controller: Controller): void {
    this.context.logger.info(`Collecting data for controller tests: "${this.moduleName}"`);

    for (const [, action] of controller.actionEntries()) {
      this.actions.push(action);
    }
  }

  generateCode(): void {
    this.context.logger.info(`Generating code of controller tests: "${this.moduleName}"`);

    this.sourceFile.writeDefmodule(this.moduleName, () => {
      this.sourceFile.writeUse(this.context.project.getModuleName('ConnCase'), 'async: true');
      this.sourceFile.writeLine('# add aliases here');
      this.sourceFile.writeLine('# import Hammox');
      this.sourceFile.writeLine('# setup :verify_on_exit!');

      for (const action of this.actions) {
        this.sourceFile.newLine();
        this.sourceFile.writeLine(`test "${action.getName()}", %{conn: conn} do`);
        this.sourceFile.writeIndented(() =>
          this.sourceFile.writeLines(
            '# TODO add setup code here',
            '# TODO add SUT manipulation here',
            '# TODO add expectation checking here',
          ),
        );
        this.sourceFile.writeLine('end');
      }
    });
  }
}

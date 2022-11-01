import type { Action } from './Action';
import type { Controller } from './Controller';
import type { Context } from './types';
import type { SourceFile } from '@fresha/ex-morph';

export class View {
  readonly context: Context;
  readonly moduleName: string;
  readonly sourceFile: SourceFile;
  protected readonly actions: Action[];

  constructor(context: Context, moduleName: string) {
    this.context = context;
    this.moduleName = moduleName;
    this.sourceFile = this.context.project.createViewFile(this.moduleName);
    this.actions = [];
  }

  collectData(controller: Controller): void {
    this.context.logger.info(`Generating code for the view "${this.moduleName}"`);

    for (const [, action] of controller.actionEntries()) {
      this.actions.push(action);
    }
  }

  generateCode(): void {
    this.context.logger.info(`Generating code for the view "${this.moduleName}"`);

    this.sourceFile.writeDefmodule(this.moduleName, () => {
      this.sourceFile.writeUse('Jabbax.Document');
      this.sourceFile.writeUse(this.context.project.getAppModuleName(), ':view');

      for (const action of this.actions) {
        this.sourceFile.writeFunction({
          name: 'render',
          params: [`"${action.getName()}.json-api"`, '%{}'],
          content: () => {
            this.sourceFile.writeLine(
              '# TODO you need to fill in "data", "meta" and "included" fields',
            );
            this.sourceFile.writeStruct('Document', { data: '[]', meta: '%{}', included: '[]' });
          },
        });
      }
    });
  }
}

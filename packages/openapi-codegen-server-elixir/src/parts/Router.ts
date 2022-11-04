import { maybeAddLeadingSlash } from '@fresha/openapi-codegen-utils';

import type { Controller } from './Controller';
import type { Context } from './types';

type Entry = {
  urlExp: string;
  controllerModuleAlias: string;
  actionNames: string[];
};

export class Router {
  readonly context: Context;
  protected readonly entries: Entry[];

  constructor(context: Context) {
    this.context = context;
    this.entries = [];
  }

  collectData(controller: Controller): void {
    this.context.logger.info(`Collecting routes for "${controller.moduleName}" controller`);

    const actionNames: string[] = [];
    for (const [, action] of controller.actionEntries()) {
      actionNames.push(action.getName());
    }

    this.entries.push({
      urlExp: controller.urlExp,
      controllerModuleAlias: controller.moduleAlias,
      actionNames,
    });
  }

  generateCode(): void {
    this.context.logger.info('Generating routing code');

    const lines = [
      '',
      '#',
      '# ROUTER',
      '# In your router file, add the following lines',
      '#',
      `scope "/api", ${this.context.project.getAppModuleName()} do`,
      '  pipe_through :api',
      '',
    ];

    for (const entry of this.entries) {
      const actions = entry.actionNames.map(a => `:${a}`).join(', ');
      lines.push(
        `  resources("${maybeAddLeadingSlash(entry.urlExp)}", ${
          entry.controllerModuleAlias
        }, only: [${actions}])`,
      );
    }

    lines.push('end', '');

    this.context.consoleWriter(lines.join('\n'));
  }
}

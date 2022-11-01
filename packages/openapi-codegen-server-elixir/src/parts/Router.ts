import console from 'console';

import type { Controller } from './Controller';
import type { Context } from './types';

type Entry = {
  url: string;
  controllerName: string;
  actions: string[];
};

export class Router {
  protected readonly context: Context;
  protected readonly entries: Entry[];

  constructor(context: Context) {
    this.context = context;
    this.entries = [];
  }

  collectData(controller: Controller): void {
    this.context.logger.info(`Collecting routes for "${controller.moduleName}" controller`);

    const entry: Entry = {
      url: '""',
      controllerName: controller.moduleName.split('.').at(-1)!,
      actions: [],
    };

    for (const [actionName] of controller.actionEntries()) {
      entry.actions.push(actionName);
    }

    this.entries.push(entry);
  }

  generateCode(): void {
    this.context.logger.info('Generating routing code');

    const lines = ['', '', '# TODO put JSON:API routes here', '', 'scope "/api", ElixirApiWeb do'];

    for (const entry of this.entries) {
      const actions = entry.actions.map(a => `:${a}`).join(', ');
      lines.push(`  resources("/", ${entry.controllerName}, only: [${actions}])`);
    }

    lines.push('end');

    console.log(lines.join('\n'));
  }
}

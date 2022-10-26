import console from 'console';

import { Action } from './Action';

import type { Generator } from './Generator';
import type { Logger } from '@fresha/openapi-codegen-utils';
import type { PathItemModel } from '@fresha/openapi-model/build/3.0.3';

export class Controller {
  static makeModuleName(pathUrl: string): string {
    return '' ?? pathUrl;
  }

  static makeFileName(): string {
    return '';
  }

  readonly parent: Generator;
  readonly logger: Logger;
  protected readonly actions: Map<string, Action>;

  constructor(parent: Generator) {
    this.parent = parent;
    this.logger = this.parent.logger;
    this.actions = new Map<string, Action>();
  }

  generateCode(): void {
    for (const action of this.actions.values()) {
      action.generateCode();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  collectData(pathUrl: string, pathItem: PathItemModel): void {
    console.log(pathUrl, pathItem);
  }
}

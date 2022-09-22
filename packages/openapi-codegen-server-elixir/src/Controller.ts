import console from 'console';

import type { Action } from './Action';
import type { Generator } from './Generator';
import type { PathItemModel } from '@fresha/openapi-model/build/3.0.3';

export class Controller {
  static makeModuleName(pathUrl: string): string {
    return '' ?? pathUrl;
  }

  static makeFileName(): string {
    return '';
  }

  private readonly generator: Generator;
  private readonly actions: Action[];

  constructor(generator: Generator) {
    this.generator = generator;
    this.actions = [];
  }

  generateCode(): void {
    console.log(!!this.generator);
    for (const action of this.actions) {
      action.generateCode();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  processPathItem(pathUrl: string, pathItem: PathItemModel): void {
    console.log(pathUrl, pathItem);
  }
}

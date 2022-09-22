import console from 'console';

import type { Controller } from './Controller';
import type { Generator } from './Generator';

export class Router {
  static makeFileName(): string {
    return '';
  }

  private readonly generator: Generator;

  constructor(generator: Generator) {
    this.generator = generator;
  }

  // eslint-disable-next-line class-methods-use-this
  processController(controller: Controller): void {
    console.log(!!controller);
  }

  generateCode(): void {
    console.log(this.generator);
  }
}

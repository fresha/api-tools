import console from 'console';

import type { Generator } from './Generator';

export class Resource {
  static makeModuleName(): string {
    return '';
  }

  static makeFileName(): string {
    return '';
  }

  readonly generator: Generator;

  constructor(generator: Generator) {
    this.generator = generator;
  }

  generateCode(): void {
    console.log(!!this.generator);
  }
}

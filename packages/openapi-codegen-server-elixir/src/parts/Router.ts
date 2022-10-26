import type { Controller } from './Controller';
import type { Generator } from './Generator';
import type { Logger } from '@fresha/openapi-codegen-utils';

export class Router {
  static makeFileName(): string {
    return '';
  }

  readonly parent: Generator;
  readonly logger: Logger;

  constructor(parent: Generator) {
    this.parent = parent;
    this.logger = this.parent.logger;
  }

  // eslint-disable-next-line class-methods-use-this
  processController(controller: Controller): void {
    this.logger.info('Processing controller');
  }

  generateCode(): void {
    this.logger.info('Generating code');
  }
}

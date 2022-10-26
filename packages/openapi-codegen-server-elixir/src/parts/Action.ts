import type { Controller } from './Controller';
import type { Logger } from '@fresha/openapi-codegen-utils';

export class Action {
  readonly parent: Controller;
  readonly logger: Logger;

  constructor(parent: Controller) {
    this.parent = parent;
    this.logger = this.parent.logger;
  }

  generateCode(): void {
    this.logger.info('Generating code');
  }
}

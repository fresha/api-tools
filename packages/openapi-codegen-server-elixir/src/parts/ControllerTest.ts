import type { Controller } from './Controller';
import type { Logger } from '@fresha/openapi-codegen-utils';

export class ControllerTest {
  readonly parent: Controller;
  readonly logger: Logger;

  constructor(parent: Controller) {
    this.parent = parent;
    this.logger = this.parent.logger;
  }

  // eslint-disable-next-line class-methods-use-this
  collectData(): void {}

  // eslint-disable-next-line class-methods-use-this
  generateCode(): void {}
}

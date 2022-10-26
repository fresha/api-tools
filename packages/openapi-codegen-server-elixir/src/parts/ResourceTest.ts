import { Logger } from '@fresha/openapi-codegen-utils';

import { Generator } from './Generator';

export class ResourceTest {
  readonly parent: Generator;
  readonly logger: Logger;

  constructor(parent: Generator) {
    this.parent = parent;
    this.logger = this.parent.logger;
  }

  // eslint-disable-next-line class-methods-use-this
  collectData(): void {}

  // eslint-disable-next-line class-methods-use-this
  generateCode(): void {}
}

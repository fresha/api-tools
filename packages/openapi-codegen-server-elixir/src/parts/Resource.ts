import type { Generator } from './Generator';
import type { Logger } from '@fresha/openapi-codegen-utils';

export class Resource {
  static makeModuleName(): string {
    return '';
  }

  static makeFileName(): string {
    return '';
  }

  readonly parent: Generator;
  readonly logger: Logger;
  readonly type: string;

  constructor(parent: Generator) {
    this.parent = parent;
    this.logger = this.parent.logger;
    this.type = 'resource';
  }

  generateCode(): void {
    this.logger.info(`Generating code for resource ${this.type}`);
  }
}

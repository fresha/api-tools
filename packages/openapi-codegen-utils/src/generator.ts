import { Context } from './context';

export class Generator<T extends Context> {
  readonly context: T;

  constructor(context: T) {
    this.context = context;
  }

  run(): void {
    this.context.logger.info('Collecting data ...');
    this.collectData();
    this.context.logger.info('Generating code ...');
    this.generateCode();
  }

  // eslint-disable-next-line class-methods-use-this
  protected collectData(): void {}

  // eslint-disable-next-line class-methods-use-this
  protected generateCode(): void {}
}

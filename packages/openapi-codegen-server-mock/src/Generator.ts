import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

type GeneratorOptions = {
  outputPath: string;
  useJsonApi: boolean;
  verbose: boolean;
  dryRun: boolean;
};

export class Generator {
  readonly openapi: OpenAPIModel;
  readonly options: GeneratorOptions;

  constructor(openapi: OpenAPIModel, options: GeneratorOptions) {
    this.openapi = openapi;
    this.options = options;
  }

  // eslint-disable-next-line class-methods-use-this
  collectData(): void {}

  // eslint-disable-next-line class-methods-use-this
  generateCode(): void {}
}

import { LinterResult } from './LinterResult';

import type { Linter, LinterConfig } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export type ConfigOptions = {
  config: LinterConfig;
  maxWarnings: number;
  autoFix: boolean;
  verbose: boolean;
};

export class DefaultLinter implements Linter {
  readonly #options: ConfigOptions;
  readonly #result: LinterResult;

  constructor(options: ConfigOptions) {
    this.#result = new LinterResult(options.maxWarnings);
    this.#options = options;
  }

  get result(): LinterResult {
    return this.#result;
  }

  run(openapi: OpenAPIModel): boolean {
    let modified = false;
    for (const rule of this.#options.config.rules()) {
      modified ||= !!rule.run(openapi, this.#result);
    }
    return modified;
  }
}

export const createLinter = (options: ConfigOptions): Linter => {
  return new DefaultLinter(options);
};

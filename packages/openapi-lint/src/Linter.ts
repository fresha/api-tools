import { LinterResult } from './LinterResult';
import { Rule, preset } from './rules';

import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export type ConfigOptions = {
  configPath?: string;
  autoFix: boolean;
  verbose: boolean;
};

export class Linter {
  readonly #rules: Rule[];
  readonly #result: LinterResult;
  readonly #options: ConfigOptions;

  constructor(options: ConfigOptions) {
    this.#rules = [];
    this.#result = new LinterResult();
    this.#options = options;
  }

  configure(): void {
    this.#rules.push(...preset);
  }

  run(openapi: OpenAPIModel, filePath?: string): boolean {
    this.#result.setCurrentFile(filePath);

    let modified = false;
    for (const rule of this.#rules) {
      modified ||= !!rule.run(openapi, this.#result, this.#options);
    }
    return modified;
  }

  print(): void {
    this.#result.print();
  }
}

import type { Result, Severity } from '../types';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export interface RuleOptions {
  autoFix: boolean;
  severity: Severity;
}

export type RuleFunc = (openapi: OpenAPIModel, result: Result, options: RuleOptions) => boolean;

export interface RuleModule {
  readonly id: string;
  readonly autoFixable: boolean;

  run: RuleFunc;
}

export interface RulesetModule {
  readonly id: string;
  readonly rules: ReadonlyArray<RuleModule>;
}

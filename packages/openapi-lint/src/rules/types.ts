import type { LinterResult } from '../LinterResult';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export interface RuleOptions {
  autoFix: boolean;
}

export type RuleFunc = (
  openapi: OpenAPIModel,
  result: LinterResult,
  options: RuleOptions,
) => boolean;

export interface Rule {
  readonly id: string;
  readonly autoFixable: boolean;

  run: RuleFunc;
}

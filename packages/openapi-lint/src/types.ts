import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

export type Severity = 'error' | 'warning';

export interface Rule {
  readonly id: string;
  readonly severity: Severity;

  run(openapi: OpenAPIModel, result: Result): boolean;
}

export interface LinterConfig {
  readonly ruleCount: number;
  rules(): IterableIterator<Rule>;
  print(): void;
}

export type JSONPointer = string;

export interface Issue {
  readonly ruleId: string;
  readonly severity: Severity;
  readonly file: string;
  readonly line: number;
  readonly pointer: JSONPointer;
  readonly message: string;
}

export interface Result {
  readonly isFailure: boolean;
  readonly issueCount: number;
  issues(): IterableIterator<Issue>;
  addIssue(message: Issue): void;
}

export interface Linter {
  readonly result: Result;
  run(openapi: OpenAPIModel): boolean;
}

export interface Formatter {
  format(result: Result): void;
}

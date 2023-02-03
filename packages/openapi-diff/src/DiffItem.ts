import type { Severity } from './types';

export class DiffItem {
  readonly #pointer: string;
  readonly #severity: Severity;
  readonly #message: string;

  constructor(pointer: string, severity: Severity, message: string) {
    this.#pointer = pointer;
    this.#severity = severity;
    this.#message = message;
  }

  get pointer(): string {
    return this.#pointer;
  }

  get severity(): Severity {
    return this.#severity;
  }

  get message(): string {
    return this.#message;
  }
}

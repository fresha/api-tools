import assert from 'assert';

import { Node } from './Node';
import { Server } from './Server';

import type { ServerVariableModel } from './types';
import type { CommonMarkString, Nullable } from '@fresha/api-tools-core';

export class ServerVariable extends Node<Server> implements ServerVariableModel {
  readonly #allowedValues: Set<string>;
  #defaultValue: string;
  #description: Nullable<CommonMarkString>;

  constructor(parent: Server) {
    super(parent);
    this.#allowedValues = new Set<string>();
    this.#defaultValue = '';
    this.#description = null;
  }

  get allowedValueCount(): number {
    return this.#allowedValues.size;
  }

  allowedValues(): IterableIterator<string> {
    return this.#allowedValues.values();
  }

  hasAllowedValue(value: string): boolean {
    return this.#allowedValues.has(value);
  }

  addAllowedValue(value: string): void {
    this.#allowedValues.add(value);
  }

  removeAllowedValue(value: string): void {
    this.#allowedValues.delete(value);
    if (this.#allowedValues.size && this.#defaultValue === value) {
      this.#defaultValue = '';
    }
  }

  clearAllowedValues(): void {
    this.#allowedValues.clear();
  }

  get defaultValue(): string {
    return this.#defaultValue;
  }

  set defaultValue(value: string) {
    assert(
      !this.#allowedValues.size || this.#allowedValues.has(value),
      'Default value must also be among allowed values',
    );
    this.#defaultValue = value;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }
}

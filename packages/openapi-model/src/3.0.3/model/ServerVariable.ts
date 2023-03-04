import assert from 'assert';

import { BasicNode } from './BasicNode';

import type { ServerVariableModel, ServerVariableModelParent } from './types';
import type { CommonMarkString, Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#server-variable-object
 */
export class ServerVariable
  extends BasicNode<ServerVariableModelParent>
  implements ServerVariableModel
{
  readonly #allowedValues: Set<string>;
  #defaultValue: string;
  #description: Nullable<CommonMarkString>;

  constructor(parent: ServerVariableModelParent, defaultValue: string) {
    super(parent);
    this.#allowedValues = new Set<string>();
    this.#defaultValue = defaultValue;
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

  addAllowedValues(...values: string[]): void {
    for (const value of values) {
      this.#allowedValues.add(value);
    }
  }

  deleteAllowedValues(...values: string[]): void {
    let resetDefault = false;
    for (const value of values) {
      this.#allowedValues.delete(value);
      if (this.#defaultValue === value) {
        resetDefault = true;
      }
    }
    if (resetDefault && !this.#allowedValues.size) {
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

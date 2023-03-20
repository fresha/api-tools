import assert from 'assert';

import { BasicNode } from '../BasicNode';
import { assertValidUrlOrNull } from '../utils';

import type { OAuthFlowModelParent, OAuthFlowType } from '../types';
import type { URLString, Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export abstract class OAuthFlowBase<
  T extends OAuthFlowType,
> extends BasicNode<OAuthFlowModelParent> {
  readonly #type: T;
  #refreshUrl: Nullable<URLString>;
  readonly #scopes: Map<string, string>;

  constructor(parent: OAuthFlowModelParent, type: T) {
    super(parent);
    this.#type = type;
    this.#refreshUrl = null;
    this.#scopes = new Map<string, string>();
  }

  get type(): T {
    return this.#type;
  }

  get refreshUrl(): Nullable<URLString> {
    return this.#refreshUrl;
  }

  set refreshUrl(value: Nullable<URLString>) {
    assertValidUrlOrNull(value);
    this.#refreshUrl = value;
  }

  get scopeCount(): number {
    return this.#scopes.size;
  }

  scopeNames(): IterableIterator<string> {
    return this.#scopes.keys();
  }

  scopes(): IterableIterator<[string, string]> {
    return this.#scopes.entries();
  }

  hasScope(name: string): boolean {
    return this.#scopes.has(name);
  }

  getScopeDescription(name: string): string {
    const result = this.#scopes.get(name);
    assert(result != null, `Scope '${name}' does not exist`);
    return result;
  }

  addScope(name: string, description: string): void {
    assert(!this.#scopes.has(name), `Scope '${name}' already exists`);
    this.#scopes.set(name, description);
  }

  deleteScope(key: string): void {
    this.#scopes.delete(key);
  }

  clearScopes(): void {
    this.#scopes.clear();
  }
}

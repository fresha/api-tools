import assert from 'assert';

import { Node } from '../../Node';

import type { OAuthFlows } from './OAuthFlows';
import type { OAuthFlowModelBase } from '../../types';
import type { URLString } from '@fresha/api-tools-core';

export type OAuthFlowParent = OAuthFlows;

export class OAuthFlowBase extends Node<OAuthFlowParent> implements OAuthFlowModelBase {
  #refreshUrl: URLString;
  readonly #scopes: Map<string, string>;

  constructor(parent: OAuthFlowParent, refreshUrl: URLString) {
    super(parent);
    assert(refreshUrl, `refreshUrl must not be empty`);
    this.#refreshUrl = refreshUrl;
    this.#scopes = new Map<string, string>();
  }

  get refreshUrl(): URLString {
    return this.#refreshUrl;
  }

  set refreshUrl(value: URLString) {
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
    assert(result !== undefined, `There is no scope named '${name}'`);
    return result;
  }

  addScope(name: string, description: string): void {
    assert(!this.hasScope(name), `Scope '${name}' already exists`);
    this.#scopes.set(name, description);
  }

  deleteScope(name: string): void {
    this.#scopes.delete(name);
  }

  clearScopes(): void {
    this.#scopes.clear();
  }
}

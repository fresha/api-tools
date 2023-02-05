import assert from 'assert';

import type { SpecificationExtensionsModel } from './types';
import type { Disposable, JSONValue } from '@fresha/api-tools-core';

export class Node<TParent> implements Disposable, SpecificationExtensionsModel {
  #parent: TParent;
  readonly #extensions: Map<string, JSONValue>;

  constructor(parent: TParent) {
    this.#parent = parent;
    this.#extensions = new Map<string, JSONValue>();
  }

  get parent(): TParent {
    return this.#parent;
  }

  // eslint-disable-next-line class-methods-use-this
  dispose(): void {}

  get extensionCount(): number {
    return this.#extensions.size;
  }

  extensions(): IterableIterator<[string, JSONValue]> {
    return this.#extensions.entries();
  }

  extensionKeys(): IterableIterator<string> {
    return this.#extensions.keys();
  }

  hasExtension(key: string): boolean {
    return this.#extensions.has(key);
  }

  getExtension(key: string): JSONValue {
    const result = this.#extensions.get(key);
    assert(result !== undefined, `Expected to have extension key ${key}`);
    return result;
  }

  setExtension(key: string, value: JSONValue): void {
    this.#extensions.set(key, value);
  }

  deleteExtension(key: string): void {
    this.#extensions.delete(key);
  }

  clearExtensions(): void {
    this.#extensions.clear();
  }
}

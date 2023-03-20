import assert from 'assert';

import type {
  ExtensionFields,
  OpenAPIModel,
  SpecificationExtensionsModel,
  TreeNodeModel,
} from './types';
import type { Disposable, JSONValue } from '@fresha/api-tools-core';

export interface TreeParent {
  readonly root: OpenAPIModel;
}

export class BasicNode<TParent extends TreeParent>
  implements TreeNodeModel<TParent>, Disposable, SpecificationExtensionsModel
{
  readonly #root: OpenAPIModel;
  readonly #parent: TParent;
  readonly #extensions: ExtensionFields;

  constructor(parent: TParent) {
    this.#parent = parent;
    this.#root = parent.root;
    this.#extensions = new Map<string, JSONValue>();
  }

  get root(): OpenAPIModel {
    return this.#root;
  }

  get parent(): TParent {
    return this.#parent;
  }

  // eslint-disable-next-line class-methods-use-this
  dispose(): void {}

  get extensionCount(): number {
    return this.#extensions.size;
  }

  extensionKeys(): IterableIterator<string> {
    return this.#extensions.keys();
  }

  extensions(): IterableIterator<[string, JSONValue]> {
    return this.#extensions.entries();
  }

  hasExtension(key: string): boolean {
    return this.#extensions.has(key);
  }

  getExtension(key: string): JSONValue | undefined {
    return this.#extensions.get(key);
  }

  getExtensionOrThrow(key: string): JSONValue {
    const result = this.getExtension(key);
    assert(result !== undefined, `Cannot find extension '${key}'`);
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

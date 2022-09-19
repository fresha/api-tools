import { BasicNode } from './BasicNode';

import type { OpenAPI } from './OpenAPI';
import type { PathItem } from './PathItem';
import type { ParametrisedURLString, PathsModel } from './types';

export type PathsParent = OpenAPI;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#paths-object
 */
export class Paths extends BasicNode<PathsParent> implements PathsModel {
  items: Map<ParametrisedURLString, PathItem>;

  constructor(parent: OpenAPI) {
    super(parent);
    this.items = new Map<ParametrisedURLString, PathItem>();
  }

  clear(): void {
    this.items.clear();
  }

  delete(key: string): boolean {
    return this.items.delete(key);
  }

  forEach(
    callbackfn: (value: PathItem, key: string, map: Map<string, PathItem>) => void,
    thisArg?: unknown,
  ): void {
    this.items.forEach(callbackfn, thisArg);
  }

  get(key: string): PathItem | undefined {
    return this.items.get(key);
  }

  has(key: string): boolean {
    return this.items.has(key);
  }

  set(key: string, value: PathItem): this {
    this.items.set(key, value);
    return this;
  }

  get size(): number {
    return this.items.size;
  }

  entries(): IterableIterator<[string, PathItem]> {
    return this.items.entries();
  }

  keys(): IterableIterator<string> {
    return this.items.keys();
  }

  values(): IterableIterator<PathItem> {
    return this.items.values();
  }

  [Symbol.iterator](): IterableIterator<[string, PathItem]> {
    return this.items.entries();
  }

  get [Symbol.toStringTag](): string {
    return this.items[Symbol.toStringTag];
  }
}

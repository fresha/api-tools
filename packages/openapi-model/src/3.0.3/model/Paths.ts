import assert from 'assert';

import { BasicNode } from './BasicNode';

import type { PathItemModel, PathsModel, PathsModelParent } from './types';
import type { ParametrisedURLString } from '@fresha/api-tools-core';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#paths-object
 */
export class Paths extends BasicNode<PathsModelParent> implements PathsModel {
  readonly items: Map<ParametrisedURLString, PathItemModel>;

  constructor(parent: PathsModelParent) {
    super(parent);
    this.items = new Map<ParametrisedURLString, PathItemModel>();
  }

  getItem(url: ParametrisedURLString): PathItemModel | undefined {
    return this.items.get(url);
  }

  getItemOrThrow(url: ParametrisedURLString): PathItemModel {
    const result = this.getItem(url);
    assert(result);
    return result;
  }

  clear(): void {
    this.items.clear();
  }

  delete(key: string): boolean {
    return this.items.delete(key);
  }

  forEach(
    callbackfn: (value: PathItemModel, key: string, map: Map<string, PathItemModel>) => void,
    thisArg?: unknown,
  ): void {
    this.items.forEach(callbackfn, thisArg);
  }

  get(key: string): PathItemModel | undefined {
    return this.items.get(key);
  }

  has(key: string): boolean {
    return this.items.has(key);
  }

  set(key: string, value: PathItemModel): this {
    this.items.set(key, value);
    return this;
  }

  get size(): number {
    return this.items.size;
  }

  entries(): IterableIterator<[string, PathItemModel]> {
    return this.items.entries();
  }

  keys(): IterableIterator<string> {
    return this.items.keys();
  }

  values(): IterableIterator<PathItemModel> {
    return this.items.values();
  }

  [Symbol.iterator](): IterableIterator<[string, PathItemModel]> {
    return this.items.entries();
  }

  get [Symbol.toStringTag](): string {
    return this.items[Symbol.toStringTag];
  }
}

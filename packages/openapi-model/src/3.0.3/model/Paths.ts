import assert from 'assert';

import { BidiMap } from '../../shared/BidiMap';

import { BasicNode } from './BasicNode';
import { PathItem } from './PathItem';

import type { PathsModel, PathsModelParent } from './types';
import type { ParametrisedURLString } from '@fresha/api-tools-core';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#paths-object
 */
export class Paths extends BasicNode<PathsModelParent> implements PathsModel {
  readonly #items: BidiMap<ParametrisedURLString, PathItem>;

  constructor(parent: PathsModelParent) {
    super(parent);
    this.#items = new BidiMap<ParametrisedURLString, PathItem>();
  }

  get pathItemCount(): number {
    return this.#items.size;
  }

  pathItemUrls(): IterableIterator<ParametrisedURLString> {
    return this.#items.keys();
  }

  pathItems(): IterableIterator<[ParametrisedURLString, PathItem]> {
    return this.#items.entries();
  }

  hasPathItem(url: ParametrisedURLString): boolean {
    return this.#items.has(url);
  }

  getItem(url: ParametrisedURLString): PathItem | undefined {
    return this.#items.get(url);
  }

  getItemOrThrow(url: ParametrisedURLString): PathItem {
    const result = this.getItem(url);
    assert(result, `Cannot find path item for '${url}' URL`);
    return result;
  }

  getItemUrl(pathItem: PathItem): string | undefined {
    return this.#items.getKey(pathItem);
  }

  getItemUrlOrThrow(pathItem: PathItem): string {
    const result = this.getItemUrl(pathItem);
    assert(result, `Cannot find URL assigned to path item`);
    return result;
  }

  setPathItem(key: string): PathItem {
    const result = new PathItem(this);
    this.#items.set(key, result);
    return result;
  }

  clear(): void {
    this.#items.clear();
  }

  delete(key: string): boolean {
    return this.#items.delete(key);
  }

  forEach(
    callbackfn: (value: PathItem, key: string, map: Map<string, PathItem>) => void,
    thisArg?: unknown,
  ): void {
    this.#items.forEach(callbackfn, thisArg);
  }

  get(key: string): PathItem | undefined {
    return this.#items.get(key);
  }

  has(key: string): boolean {
    return this.#items.has(key);
  }

  set(key: string, value: PathItem): this {
    assert(value.parent === this, `Path item at ${key} does not belong to the paths object`);
    this.#items.set(key, value);
    return this;
  }

  sort(sorter: (entry1: [string, PathItem], entry2: [string, PathItem]) => number): void {
    const entries = Array.from(this.#items).sort(sorter);

    this.#items.clear();
    for (const [key, value] of entries) {
      this.#items.set(key, value);
    }
  }
}

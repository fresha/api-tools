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
    assert(!this.#items.has(key), `Path item at ${key} already exists`);
    const result = new PathItem(this);
    this.#items.set(key, result);
    return result;
  }

  deletePathItem(key: ParametrisedURLString): void {
    this.#items.delete(key);
  }

  clearPathItems(): void {
    this.#items.clear();
  }

  sort(sorter: (entry1: [string, PathItem], entry2: [string, PathItem]) => number): void {
    const entries = Array.from(this.#items).sort(sorter);

    this.#items.clear();
    for (const [key, value] of entries) {
      this.#items.set(key, value);
    }
  }
}

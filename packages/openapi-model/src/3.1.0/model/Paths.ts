import assert from 'assert';

import { ParametrisedURLString } from '@fresha/api-tools-core';

import { Node } from './Node';
import { OpenAPI } from './OpenAPI';
import { PathItem } from './PathItem';

import type { PathsModel } from './types';

export class Paths extends Node<OpenAPI> implements PathsModel {
  readonly #items: Map<ParametrisedURLString, PathItem>;

  constructor(parent: OpenAPI) {
    super(parent);
    this.#items = new Map<ParametrisedURLString, PathItem>();
  }

  get itemCount(): number {
    return this.#items.size;
  }

  itemUrls(): IterableIterator<ParametrisedURLString> {
    return this.#items.keys();
  }

  items(): IterableIterator<[ParametrisedURLString, PathItem]> {
    return this.#items.entries();
  }

  hasItem(url: ParametrisedURLString): boolean {
    return this.#items.has(url);
  }

  addItem(url: ParametrisedURLString): PathItem {
    assert(!this.#items.has(url), `Path item '${url}' already exists`);
    const result = new PathItem(this);
    this.#items.set(url, result);
    return result;
  }

  removeItem(url: ParametrisedURLString): void {
    const item = this.#items.get(url);
    if (item) {
      item.dispose();
      this.#items.delete(url);
    }
  }

  clearItems(): void {
    this.#items.forEach(it => it.dispose());
    this.#items.clear();
  }
}

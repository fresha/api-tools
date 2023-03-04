import assert from 'assert';

import { BidiMap } from '../../shared/BidiMap';

import { BasicNode } from './BasicNode';
import { PathItem } from './PathItem';

import type { CallbackModel, CallbackModelParent } from './types';
import type { ParametrisedURLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#callback-object
 */
export class Callback extends BasicNode<CallbackModelParent> implements CallbackModel {
  readonly #pathItems: BidiMap<ParametrisedURLString, PathItem>;

  constructor(parent: CallbackModelParent) {
    super(parent);
    this.#pathItems = new BidiMap<ParametrisedURLString, PathItem>();
  }

  get pathItemCount(): number {
    return this.#pathItems.size;
  }

  pathItemUrls(): IterableIterator<ParametrisedURLString> {
    return this.#pathItems.keys();
  }

  pathItems(): IterableIterator<[ParametrisedURLString, PathItem]> {
    return this.#pathItems.entries();
  }

  hasPathItem(key: ParametrisedURLString): boolean {
    return this.#pathItems.has(key);
  }

  getItemUrl(pathItem: PathItem): string | undefined {
    return this.#pathItems.getKey(pathItem);
  }

  getItemUrlOrThrow(pathItem: PathItem): string {
    const result = this.getItemUrl(pathItem);
    assert(result, `Cannot find URL associated with path item`);
    return result;
  }

  getPathItem(key: ParametrisedURLString): PathItem | undefined {
    return this.#pathItems.get(key);
  }

  getPathItemOrThrow(key: string): PathItem {
    const result = this.getPathItem(key);
    assert(result, `Cannot find path item associated with '${key}' URL`);
    return result;
  }

  setPathItem(key: string): PathItem {
    const result = new PathItem(this);
    this.#pathItems.set(key, result);
    return result;
  }

  deletePathItem(key: string): void {
    this.#pathItems.delete(key);
  }

  clearPathItems(): void {
    this.#pathItems.clear();
  }
}

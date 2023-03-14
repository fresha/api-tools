import assert from 'assert';

import { BidiMap } from '../../BidiMap';

import { BasicNode } from './BasicNode';
import { PathItem } from './PathItem';

import type { CallbackModel, CallbackModelParent, PathItemModel, TreeNode } from './types';
import type { ParametrisedURLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#callback-object
 */
export class Callback extends BasicNode<CallbackModelParent> implements CallbackModel {
  readonly paths: BidiMap<ParametrisedURLString, PathItemModel>;

  constructor(parent: CallbackModelParent) {
    super(parent);
    this.paths = new BidiMap<ParametrisedURLString, PathItemModel>();
  }

  children(): IterableIterator<TreeNode<unknown>> {
    return this.paths.values();
  }

  getItemUrl(pathItem: PathItemModel): string | undefined {
    return this.paths.getKey(pathItem);
  }

  getItemUrlOrThrow(pathItem: PathItemModel): string {
    const result = this.getItemUrl(pathItem);
    assert(result, `Cannot find URL associated with path item`);
    return result;
  }

  getPathItem(key: ParametrisedURLString): PathItemModel | undefined {
    return this.paths.get(key);
  }

  getPathItemOrThrow(key: string): PathItemModel {
    const result = this.getPathItem(key);
    assert(result, `Cannot find path item associated with '${key}' URL`);
    return result;
  }

  setPathItem(key: string): PathItemModel {
    const result = new PathItem(this);
    this.paths.set(key, result);
    return result;
  }

  deletePathItem(key: string): void {
    this.paths.delete(key);
  }

  clearPathItems(): void {
    this.paths.clear();
  }
}

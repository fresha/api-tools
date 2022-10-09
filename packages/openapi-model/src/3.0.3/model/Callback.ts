import { BasicNode } from './BasicNode';

import type { CallbackModel, CallbackModelParent, PathItemModel } from './types';
import type { ParametrisedURLString } from '@fresha/api-tools-core';
import assert from 'assert';
import { PathItem } from './PathItem';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#callback-object
 */
export class Callback extends BasicNode<CallbackModelParent> implements CallbackModel {
  readonly paths: Map<string, PathItemModel>;

  constructor(parent: CallbackModelParent) {
    super(parent);
    this.paths = new Map<ParametrisedURLString, PathItemModel>();
  }

  getPathItem(key: ParametrisedURLString): PathItemModel | undefined {
    return this.paths.get(key);
  }

  getPathItemOrThrow(key: string): PathItemModel {
    const result = this.getPathItem(key);
    assert(result);
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

import { BasicNode } from './BasicNode';

import type { Components } from './Components';
import type { Operation } from './Operation';
import type { PathItem } from './PathItem';
import type { ParametrisedURLString, CallbackModel } from './types';

export type CallbackParent = Components | Operation;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#callback-object
 */
export class Callback extends BasicNode<CallbackParent> implements CallbackModel {
  readonly paths: Map<ParametrisedURLString, PathItem>;

  constructor(parent: CallbackParent) {
    super(parent);
    this.paths = new Map<ParametrisedURLString, PathItem>();
  }
}

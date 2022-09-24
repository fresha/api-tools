import { BasicNode } from './BasicNode';

import type { CallbackModel, CallbackModelParent, PathItemModel } from './types';
import type { ParametrisedURLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#callback-object
 */
export class Callback extends BasicNode<CallbackModelParent> implements CallbackModel {
  readonly paths: Map<ParametrisedURLString, PathItemModel>;

  constructor(parent: CallbackModelParent) {
    super(parent);
    this.paths = new Map<ParametrisedURLString, PathItemModel>();
  }
}

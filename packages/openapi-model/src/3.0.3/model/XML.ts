import { BasicNode } from './BasicNode';

import type { TreeNode, XMLModel, XMLModelParent } from './types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#xml-object
 */
export class XML extends BasicNode<XMLModelParent> implements XMLModel {
  name: Nullable<string>;
  namespace: Nullable<string>;
  prefix: Nullable<string>;
  attribute: boolean;
  wrapped: boolean;

  constructor(parent: XMLModelParent) {
    super(parent);
    this.name = null;
    this.namespace = null;
    this.prefix = null;
    this.attribute = false;
    this.wrapped = false;
  }

  *children(): IterableIterator<TreeNode<unknown>> {

  }
}

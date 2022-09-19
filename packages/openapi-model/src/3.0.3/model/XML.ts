import { BasicNode } from './BasicNode';

import type { Schema } from './Schema';
import type { XMLModel } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export type XMLParent = Schema;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#xml-object
 */
export class XML extends BasicNode<XMLParent> implements XMLModel {
  name: Nullable<string>;
  namespace: Nullable<string>;
  prefix: Nullable<string>;
  attribute: boolean;
  wrapped: boolean;

  constructor(parent: XMLParent) {
    super(parent);
    this.name = null;
    this.namespace = null;
    this.prefix = null;
    this.attribute = false;
    this.wrapped = false;
  }
}

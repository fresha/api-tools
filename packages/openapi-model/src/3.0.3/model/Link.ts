import { BasicNode } from './BasicNode';

import type { Server } from './Server';
import type { LinkModel, LinkModelParent } from './types';
import type { Nullable, JSONValue } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#link-object
 */
export class Link extends BasicNode<LinkModelParent> implements LinkModel {
  operationRef: Nullable<string>;
  operationId: Nullable<string>;
  readonly parameters: Map<string, JSONValue>;
  requestBody: JSONValue;
  description: Nullable<string>;
  server: Nullable<Server>;

  constructor(parent: LinkModelParent) {
    super(parent);
    this.operationRef = null;
    this.operationId = null;
    this.parameters = new Map<string, JSONValue>();
    this.requestBody = null;
    this.description = null;
    this.server = null;
  }
}

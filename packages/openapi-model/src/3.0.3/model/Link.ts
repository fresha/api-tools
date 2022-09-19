import { BasicNode } from './BasicNode';

import type { Components } from './Components';
import type { Response } from './Response';
import type { Server } from './Server';
import type { LinkModel } from './types';
import type { Nullable, JSONValue } from '@fresha/api-tools-core';

export type LinkParent = Components | Response;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#link-object
 */
export class Link extends BasicNode<LinkParent> implements LinkModel {
  operationRef: Nullable<string>;
  operationId: Nullable<string>;
  readonly parameters: Map<string, JSONValue>;
  requestBody: JSONValue;
  description: Nullable<string>;
  server: Nullable<Server>;

  constructor(parent: LinkParent) {
    super(parent);
    this.operationRef = null;
    this.operationId = null;
    this.parameters = new Map<string, JSONValue>();
    this.requestBody = null;
    this.description = null;
    this.server = null;
  }
}

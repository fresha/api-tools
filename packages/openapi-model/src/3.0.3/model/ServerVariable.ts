import { BasicNode } from './BasicNode';

import type { Server } from './Server';
import type { ServerVariableModel } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export type ServerVariableParent = Server;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#server-variable-object
 */
export class ServerVariable extends BasicNode<ServerVariableParent> implements ServerVariableModel {
  enum: Nullable<string[]>;
  default: string;
  description: Nullable<string>;

  constructor(parent: ServerVariableParent, defaultValue: string) {
    super(parent);
    this.enum = null;
    this.default = defaultValue;
    this.description = null;
  }
}

import { BasicNode } from './BasicNode';

import type { ServerVariableModel, ServerVariableModelParent } from './types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#server-variable-object
 */
export class ServerVariable
  extends BasicNode<ServerVariableModelParent>
  implements ServerVariableModel
{
  readonly enum: Set<string>;
  default: string;
  description: Nullable<string>;

  constructor(parent: ServerVariableModelParent, defaultValue: string) {
    super(parent);
    this.enum = new Set<string>();
    this.default = defaultValue;
    this.description = null;
  }

  addEnum(...values: string[]): void {
    for (const value of values) {
      this.enum.add(value);
    }
  }

  deleteEnumValue(...values: string[]): void {
    for (const value of values) {
      this.enum.delete(value);
    }
  }

  clearEnumValues(): void {
    this.enum.clear();
  }
}

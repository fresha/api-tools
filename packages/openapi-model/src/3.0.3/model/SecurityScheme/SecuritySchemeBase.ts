import { BasicNode } from '../BasicNode';

import type { SecuritySchemaModelParent, SecuritySchemeType } from '../types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export abstract class SecuritySchemeBase extends BasicNode<SecuritySchemaModelParent> {
  readonly type: SecuritySchemeType;
  description: Nullable<string>;

  constructor(parent: SecuritySchemaModelParent, type: SecuritySchemeType) {
    super(parent);
    this.type = type;
    this.description = null;
  }
}

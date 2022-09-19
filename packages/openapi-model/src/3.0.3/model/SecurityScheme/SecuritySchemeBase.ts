import { BasicNode } from '../BasicNode';

import type { Components } from '../Components';
import type { Nullable } from '@fresha/api-tools-core';

export type SecuritySchemeParent = Components;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export abstract class SecuritySchemeBase extends BasicNode<SecuritySchemeParent> {
  description: Nullable<string>;

  constructor(parent: SecuritySchemeParent) {
    super(parent);
    this.description = null;
  }
}

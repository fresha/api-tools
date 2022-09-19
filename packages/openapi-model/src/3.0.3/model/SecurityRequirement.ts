import { BasicNode } from './BasicNode';

import type { OpenAPI } from './OpenAPI';
import type { Operation } from './Operation';
import type { SecurityRequirementModel } from './types';

export type SecurityRequirementParent = OpenAPI | Operation;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-requirement-object
 */
export class SecurityRequirement
  extends BasicNode<SecurityRequirementParent>
  implements SecurityRequirementModel
{
  scopes: Map<string, string[]>;

  constructor(parent: SecurityRequirementParent) {
    super(parent);
    this.scopes = new Map<string, string[]>();
  }
}

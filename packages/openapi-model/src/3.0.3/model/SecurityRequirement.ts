import assert from 'assert';

import { BasicNode } from './BasicNode';

import type { SecurityRequirementModel, SecurityRequirementModelParent, TreeNode } from './types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-requirement-object
 */
export class SecurityRequirement
  extends BasicNode<SecurityRequirementModelParent>
  implements SecurityRequirementModel
{
  readonly scopes: Map<string, string[]>;

  constructor(parent: SecurityRequirementModelParent) {
    super(parent);
    this.scopes = new Map<string, string[]>();
  }

  *children(): IterableIterator<TreeNode<unknown>> {
  }

  getScopes(schemeName: string): string[] | undefined {
    return this.scopes.get(schemeName);
  }

  getScopesOrThrow(schemeName: string): string[] {
    const result = this.getScopes(schemeName);
    assert(result);
    return result;
  }

  addScopes(schemeName: string, ...scopes: string[]): void {
    let schemeScopes = this.scopes.get(schemeName);
    if (!schemeScopes) {
      schemeScopes = [];
      this.scopes.set(schemeName, schemeScopes);
    }
    for (const scope of scopes) {
      if (!scopes.includes(scope)) {
        scopes.push(scope);
      }
    }
  }

  deleteScopes(schemeName: string, ...scopes: string[]): void {
    if (!scopes.length) {
      this.scopes.delete(schemeName);
    } else {
      const schemeScopes = this.scopes.get(schemeName);
      if (schemeScopes) {
        const newSchemeScopes = schemeScopes.filter(s => !schemeScopes.includes(s));
        schemeScopes.splice(0, schemeScopes.length, ...newSchemeScopes);
      }
    }
  }

  clearScopes(): void {
    this.scopes.clear();
  }
}

import assert from 'assert';

import { BasicNode } from '../BasicNode';

import type { OAuthFlowModelParent, OAuthFlowType } from '../types';
import type { URLString, Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export abstract class OAuthFlowBase extends BasicNode<OAuthFlowModelParent> {
  readonly type: OAuthFlowType;
  refreshUrl: Nullable<URLString>;
  readonly scopes: Map<string, string>;

  constructor(parent: OAuthFlowModelParent, type: OAuthFlowType) {
    super(parent);
    this.type = type;
    this.refreshUrl = null;
    this.scopes = new Map<string, string>();
  }

  getScope(key: string): string | undefined {
    return this.scopes.get(key);
  }

  getScopeOrThrow(key: string): string {
    const result = this.getScope(key);
    assert(result !== undefined);
    return result;
  }

  setScope(key: string, value: string): void {
    this.scopes.set(key, value);
  }

  deleteScope(key: string): void {
    this.scopes.delete(key);
  }

  clearScopes(): void {
    this.scopes.clear();
  }
}

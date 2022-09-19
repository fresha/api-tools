import { BasicNode } from '../BasicNode';

import type { OAuthFlows } from './OAuthFlows';
import type { URLString, Nullable } from '@fresha/api-tools-core';

export type OAuthFlowType = 'implicit' | 'password' | 'clientCredentials' | 'authorizationCode';

export type OAuthFlowParent = OAuthFlows;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export abstract class OAuthFlowBase extends BasicNode<OAuthFlowParent> {
  readonly type: OAuthFlowType;
  refreshUrl: Nullable<URLString>;
  scopes: Map<string, string>;

  constructor(parent: OAuthFlowParent, type: OAuthFlowType) {
    super(parent);
    this.type = type;
    this.refreshUrl = null;
    this.scopes = new Map<string, string>();
  }
}

import { BasicNode } from '../BasicNode';

import type {
  OAuthAuthorizationCodeFlowModel,
  OAuthClientCredentialsFlowModel,
  OAuthFlowsModel,
  OAuthFlowsModelParent,
  OAuthImplicitFlowModel,
  OAuthPasswordFlowModel,
} from '../types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flows-object
 */
export class OAuthFlows extends BasicNode<OAuthFlowsModelParent> implements OAuthFlowsModel {
  implicit: Nullable<OAuthImplicitFlowModel>;
  password: Nullable<OAuthPasswordFlowModel>;
  clientCredentials: Nullable<OAuthClientCredentialsFlowModel>;
  authorizationCode: Nullable<OAuthAuthorizationCodeFlowModel>;

  constructor(parent: OAuthFlowsModelParent) {
    super(parent);
    this.implicit = null;
    this.password = null;
    this.clientCredentials = null;
    this.authorizationCode = null;
  }
}

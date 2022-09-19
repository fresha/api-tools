import { BasicNode } from '../BasicNode';

import type { OAuth2Scheme } from '../SecurityScheme/OAuth2Scheme';
import type { OAuthFlowsModel } from '../types';
import type { OAuthAuthorisationCodeFlow } from './OAuthAuthorisationCodeFlow';
import type { OAuthClientCredentialsFlow } from './OAuthClientCredentialsFlow';
import type { OAuthImplicitFlow } from './OAuthImplicitFlow';
import type { OAuthPasswordFlow } from './OAuthPasswordFlow';
import type { Nullable } from '@fresha/api-tools-core';

export type OAuthFlowsParent = OAuth2Scheme;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flows-object
 */
export class OAuthFlows extends BasicNode<OAuthFlowsParent> implements OAuthFlowsModel {
  implicit: Nullable<OAuthImplicitFlow>;
  password: Nullable<OAuthPasswordFlow>;
  clientCredentials: Nullable<OAuthClientCredentialsFlow>;
  authorizationCode: Nullable<OAuthAuthorisationCodeFlow>;

  constructor(parent: OAuthFlowsParent) {
    super(parent);
    this.implicit = null;
    this.password = null;
    this.clientCredentials = null;
    this.authorizationCode = null;
  }
}

import assert from 'assert';

import { BasicNode } from '../BasicNode';

import { OAuthAuthorisationCodeFlow } from './OAuthAuthorisationCodeFlow';
import { OAuthClientCredentialsFlow } from './OAuthClientCredentialsFlow';
import { OAuthImplicitFlow } from './OAuthImplicitFlow';
import { OAuthPasswordFlow } from './OAuthPasswordFlow';

import type { OAuthFlowsModel, OAuthFlowsModelParent } from '../types';
import type { Nullable, URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flows-object
 */
export class OAuthFlows extends BasicNode<OAuthFlowsModelParent> implements OAuthFlowsModel {
  #implicit: Nullable<OAuthImplicitFlow>;
  #password: Nullable<OAuthPasswordFlow>;
  #clientCredentials: Nullable<OAuthClientCredentialsFlow>;
  #authorizationCode: Nullable<OAuthAuthorisationCodeFlow>;

  constructor(parent: OAuthFlowsModelParent) {
    super(parent);
    this.#implicit = null;
    this.#password = null;
    this.#clientCredentials = null;
    this.#authorizationCode = null;
  }

  get implicit(): Nullable<OAuthImplicitFlow> {
    return this.#implicit;
  }

  setImplicit(authorizationUrl: URLString): OAuthImplicitFlow {
    assert(!this.#implicit, 'Implicit flow is already set');
    this.#implicit = new OAuthImplicitFlow(this, authorizationUrl);
    return this.#implicit;
  }

  deleteImplicit(): void {
    this.#implicit = null;
  }

  get password(): Nullable<OAuthPasswordFlow> {
    return this.#password;
  }

  setPassword(tokenUrl: URLString): OAuthPasswordFlow {
    assert(!this.#password, 'Password flow is already set');
    this.#password = new OAuthPasswordFlow(this, tokenUrl);
    return this.#password;
  }

  deletePassword(): void {
    this.#password = null;
  }

  get clientCredentials(): Nullable<OAuthClientCredentialsFlow> {
    return this.#clientCredentials;
  }

  setClientCredentials(tokenUrl: URLString): OAuthClientCredentialsFlow {
    assert(!this.#clientCredentials, 'Client credentials flow is already set');
    this.#clientCredentials = new OAuthClientCredentialsFlow(this, tokenUrl);
    return this.#clientCredentials;
  }

  deleteClientCredentials(): void {
    this.#clientCredentials = null;
  }

  get authorizationCode(): Nullable<OAuthAuthorisationCodeFlow> {
    return this.#authorizationCode;
  }

  setAuthorizationCode(
    authorizationUrl: URLString,
    tokenUrl: URLString,
  ): OAuthAuthorisationCodeFlow {
    assert(!this.#authorizationCode, 'Authorization code flow is already set');
    this.#authorizationCode = new OAuthAuthorisationCodeFlow(this, authorizationUrl, tokenUrl);
    return this.#authorizationCode;
  }

  deleteAuthorizationCode(): void {
    this.#authorizationCode = null;
  }
}

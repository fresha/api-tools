import assert from 'assert';

import { Node } from '../../Node';

import { OAuthAuthorizationCodeFlow } from './OAuthAuthorizationFlow';
import { OAuthClientCredentialsFlow } from './OAuthClientCredentialsFlow';
import { OAuthImplicitFlow } from './OAuthImplicitFlow';
import { OAuthPasswordFlow } from './OAuthPasswordFlow';

import type { OAuthFlowsModel } from '../../types';
import type { OAuth2SecuritySchema } from '../OAuth2SecuritySchema';
import type { Nullable, URLString } from '@fresha/api-tools-core';

export type OAuthFlowsParent = OAuth2SecuritySchema;

export class OAuthFlows extends Node<OAuthFlowsParent> implements OAuthFlowsModel {
  #implicit: Nullable<OAuthImplicitFlow>;
  #password: Nullable<OAuthPasswordFlow>;
  #clientCredentials: Nullable<OAuthClientCredentialsFlow>;
  #authorizationCode: Nullable<OAuthAuthorizationCodeFlow>;

  constructor(parent: OAuthFlowsParent) {
    super(parent);
    this.#implicit = null;
    this.#password = null;
    this.#clientCredentials = null;
    this.#authorizationCode = null;
  }

  get implicit(): Nullable<OAuthImplicitFlow> {
    return this.#implicit;
  }

  addImplicitFlow(authorizationUrl: URLString, refreshUrl: URLString): OAuthImplicitFlow {
    assert(!this.#implicit, 'Implicit flow is already set');
    this.#implicit = new OAuthImplicitFlow(this, authorizationUrl, refreshUrl);
    return this.#implicit;
  }

  deleteImplicitFlow(): void {
    if (this.#implicit) {
      this.#implicit.dispose();
      this.#implicit = null;
    }
  }

  get password(): Nullable<OAuthPasswordFlow> {
    return this.#password;
  }

  addPasswordFlow(tokenUrl: URLString, refreshUrl: URLString): OAuthPasswordFlow {
    assert(!this.#password, 'Password flow is already set');
    this.#password = new OAuthPasswordFlow(this, tokenUrl, refreshUrl);
    return this.#password;
  }

  deletePasswordFlow(): void {
    if (this.#password) {
      this.#password.dispose();
      this.#password = null;
    }
  }

  get clientCredentials(): Nullable<OAuthClientCredentialsFlow> {
    return this.#clientCredentials;
  }

  addClientCredentialsFlow(tokenUrl: URLString, refreshUrl: URLString): OAuthClientCredentialsFlow {
    assert(!this.#clientCredentials, 'Client credentials flow is already set');
    this.#clientCredentials = new OAuthClientCredentialsFlow(this, tokenUrl, refreshUrl);
    return this.#clientCredentials;
  }

  deleteClientCredentialsFlow(): void {
    if (this.#clientCredentials) {
      this.#clientCredentials.dispose();
      this.#clientCredentials = null;
    }
  }

  get authorizationCode(): Nullable<OAuthAuthorizationCodeFlow> {
    return this.#authorizationCode;
  }

  addAuthorizationCodeFlow(
    authorizationUrl: URLString,
    tokenUrl: URLString,
    refreshUrl: URLString,
  ): OAuthAuthorizationCodeFlow {
    assert(!this.#authorizationCode, 'Authorisation code flow is already set');
    this.#authorizationCode = new OAuthAuthorizationCodeFlow(
      this,
      authorizationUrl,
      tokenUrl,
      refreshUrl,
    );
    return this.#authorizationCode;
  }

  deleteAuthorizationCodeFlow(): void {
    if (this.#authorizationCode) {
      this.#authorizationCode.dispose();
      this.#authorizationCode = null;
    }
  }
}

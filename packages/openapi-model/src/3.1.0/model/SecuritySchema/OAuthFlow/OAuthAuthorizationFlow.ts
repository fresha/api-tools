import assert from 'assert';

import { OAuthFlowBase, OAuthFlowParent } from './OAuthFlowBase';

import type { OAuthAuthorizationCodeFlowModel } from '../../types';
import type { URLString } from '@fresha/api-tools-core';

export class OAuthAuthorizationCodeFlow
  extends OAuthFlowBase
  implements OAuthAuthorizationCodeFlowModel
{
  #authorizationUrl: URLString;
  #tokenUrl: URLString;

  constructor(
    parent: OAuthFlowParent,
    authorizationUrl: URLString,
    tokenUrl: URLString,
    refreshUrl: URLString,
  ) {
    super(parent, refreshUrl);
    this.#validateAuthorizationUrl(authorizationUrl);
    this.#authorizationUrl = authorizationUrl;
    this.#validateTokenUrl(tokenUrl);
    this.#tokenUrl = tokenUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  #validateAuthorizationUrl(value: URLString) {
    assert(value, 'Authorisation URL cannot be empty');
  }

  // eslint-disable-next-line class-methods-use-this
  #validateTokenUrl(value: URLString) {
    assert(value, 'Token URL cannot be empty');
  }

  get authorizationUrl(): URLString {
    return this.#authorizationUrl;
  }

  set authorizationUrl(value: URLString) {
    this.#validateAuthorizationUrl(value);
    this.#authorizationUrl = value;
  }

  get tokenUrl(): URLString {
    return this.#tokenUrl;
  }

  set tokenUrl(value: URLString) {
    this.#validateTokenUrl(value);
    this.#tokenUrl = value;
  }
}

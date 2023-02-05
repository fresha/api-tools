import assert from 'assert';

import { OAuthFlowBase, OAuthFlowParent } from './OAuthFlowBase';

import type { OAuthImplicitFlowModel } from '../../types';
import type { URLString } from '@fresha/api-tools-core';

export class OAuthImplicitFlow extends OAuthFlowBase implements OAuthImplicitFlowModel {
  #authorizationUrl: URLString;

  constructor(parent: OAuthFlowParent, authorizationUrl: URLString, refreshUrl: URLString) {
    super(parent, refreshUrl);
    this.#validateAuthorizationUrl(authorizationUrl);
    this.#authorizationUrl = authorizationUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  #validateAuthorizationUrl(value: URLString) {
    assert(value, 'Authorisation URL cannot be empty');
  }

  get authorizationUrl(): URLString {
    return this.#authorizationUrl;
  }

  set authorizationUrl(value: URLString) {
    this.#validateAuthorizationUrl(value);
    this.#authorizationUrl = value;
  }
}

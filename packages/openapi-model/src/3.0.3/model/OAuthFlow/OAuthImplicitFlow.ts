import { assertValidUrl } from '../utils';

import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuthFlowModelParent, OAuthImplicitFlowModel } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthImplicitFlow extends OAuthFlowBase<'implicit'> implements OAuthImplicitFlowModel {
  #authorizationUrl: URLString;

  constructor(parent: OAuthFlowModelParent, authorizationUrl: string) {
    super(parent, 'implicit');
    assertValidUrl(authorizationUrl);
    this.#authorizationUrl = authorizationUrl;
  }

  get authorizationUrl(): URLString {
    return this.#authorizationUrl;
  }

  set authorizationUrl(value: URLString) {
    assertValidUrl(value);
    this.#authorizationUrl = value;
  }
}

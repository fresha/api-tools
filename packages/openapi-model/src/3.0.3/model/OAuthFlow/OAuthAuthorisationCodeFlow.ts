import { assertValidUrl } from '../utils';

import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuthAuthorizationCodeFlowModel, OAuthFlowModelParent } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthAuthorisationCodeFlow
  extends OAuthFlowBase
  implements OAuthAuthorizationCodeFlowModel
{
  #authorizationUrl: URLString;
  #tokenUrl: URLString;

  constructor(parent: OAuthFlowModelParent, authorizationUrl: URLString, tokenUrl: URLString) {
    super(parent);
    assertValidUrl(authorizationUrl);
    this.#authorizationUrl = authorizationUrl;
    assertValidUrl(tokenUrl);
    this.#tokenUrl = tokenUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  get type(): 'authorizationCode' {
    return 'authorizationCode';
  }

  get authorizationUrl(): URLString {
    return this.#authorizationUrl;
  }

  set authorizationUrl(value: URLString) {
    assertValidUrl(value);
    this.#authorizationUrl = value;
  }

  get tokenUrl(): URLString {
    return this.#tokenUrl;
  }

  set tokenUrl(value: URLString) {
    assertValidUrl(value);
    this.#tokenUrl = value;
  }
}

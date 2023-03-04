import { assertValidUrl } from '../utils';

import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuthFlowModelParent, OAuthPasswordFlowModel } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthPasswordFlow extends OAuthFlowBase implements OAuthPasswordFlowModel {
  #tokenUrl: URLString;

  constructor(parent: OAuthFlowModelParent, tokenUrl: URLString) {
    super(parent);
    assertValidUrl(tokenUrl);
    this.#tokenUrl = tokenUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  get type(): 'password' {
    return 'password';
  }

  get tokenUrl(): URLString {
    return this.#tokenUrl;
  }

  set tokenUrl(value: URLString) {
    assertValidUrl(value);
    this.#tokenUrl = value;
  }
}

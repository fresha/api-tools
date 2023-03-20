import { assertValidUrl } from '../utils';

import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuthFlowModelParent, OAuthPasswordFlowModel } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthPasswordFlow extends OAuthFlowBase<'password'> implements OAuthPasswordFlowModel {
  #tokenUrl: URLString;

  constructor(parent: OAuthFlowModelParent, tokenUrl: URLString) {
    super(parent, 'password');
    assertValidUrl(tokenUrl);
    this.#tokenUrl = tokenUrl;
  }

  get tokenUrl(): URLString {
    return this.#tokenUrl;
  }

  set tokenUrl(value: URLString) {
    assertValidUrl(value);
    this.#tokenUrl = value;
  }
}

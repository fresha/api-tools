import { assertValidUrl } from '../utils';

import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuthClientCredentialsFlowModel, OAuthFlowModelParent } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthClientCredentialsFlow
  extends OAuthFlowBase<'clientCredentials'>
  implements OAuthClientCredentialsFlowModel
{
  #tokenUrl: URLString;

  constructor(parent: OAuthFlowModelParent, tokenUrl: URLString) {
    super(parent, 'clientCredentials');
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

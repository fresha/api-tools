import { OAuthFlowBase, OAuthFlowParent } from './OAuthFlowBase';

import type { OAuthClientCredentialsFlowModel } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthClientCredentialsFlow
  extends OAuthFlowBase
  implements OAuthClientCredentialsFlowModel
{
  tokenUrl: URLString;

  constructor(parent: OAuthFlowParent, tokenUrl: URLString) {
    super(parent, 'clientCredentials');
    this.tokenUrl = tokenUrl;
  }
}

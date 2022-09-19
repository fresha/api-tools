import { OAuthFlowBase, OAuthFlowParent } from './OAuthFlowBase';

import type { OAuthAuthorizationCodeFlowModel } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthAuthorisationCodeFlow
  extends OAuthFlowBase
  implements OAuthAuthorizationCodeFlowModel
{
  authorizationUrl: URLString;
  tokenUrl: URLString;

  constructor(parent: OAuthFlowParent, authorizationUrl: URLString, tokenUrl: URLString) {
    super(parent, 'authorizationCode');
    this.authorizationUrl = authorizationUrl;
    this.tokenUrl = tokenUrl;
  }
}

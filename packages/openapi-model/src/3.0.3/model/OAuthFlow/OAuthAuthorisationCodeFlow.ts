import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuthAuthorizationCodeFlowModel, OAuthFlowModelParent, TreeNode } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthAuthorisationCodeFlow
  extends OAuthFlowBase
  implements OAuthAuthorizationCodeFlowModel
{
  declare readonly type: 'authorizationCode';
  authorizationUrl: URLString;
  tokenUrl: URLString;

  constructor(parent: OAuthFlowModelParent, authorizationUrl: URLString, tokenUrl: URLString) {
    super(parent, 'authorizationCode');
    this.authorizationUrl = authorizationUrl;
    this.tokenUrl = tokenUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  *children(): IterableIterator<TreeNode<unknown>> {

  }
}

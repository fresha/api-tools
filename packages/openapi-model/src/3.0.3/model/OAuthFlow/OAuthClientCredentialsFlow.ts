import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuthClientCredentialsFlowModel, OAuthFlowModelParent, TreeNode } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthClientCredentialsFlow
  extends OAuthFlowBase
  implements OAuthClientCredentialsFlowModel
{
  declare readonly type: 'clientCredentials';
  tokenUrl: URLString;

  constructor(parent: OAuthFlowModelParent, tokenUrl: URLString) {
    super(parent, 'clientCredentials');
    this.tokenUrl = tokenUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  *children(): IterableIterator<TreeNode<unknown>> {

  }
}

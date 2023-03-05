import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuthFlowModelParent, OAuthImplicitFlowModel, TreeNode } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthImplicitFlow extends OAuthFlowBase implements OAuthImplicitFlowModel {
  declare readonly type: 'implicit';
  authorizationUrl: URLString;

  constructor(parent: OAuthFlowModelParent, authorizationUrl: string) {
    super(parent, 'implicit');
    this.authorizationUrl = authorizationUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  *children(): IterableIterator<TreeNode<unknown>> {

  }
}

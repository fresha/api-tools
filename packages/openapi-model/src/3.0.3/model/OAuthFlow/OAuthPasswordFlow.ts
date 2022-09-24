import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuthFlowModelParent, OAuthPasswordFlowModel } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthPasswordFlow extends OAuthFlowBase implements OAuthPasswordFlowModel {
  declare readonly type: 'password';
  tokenUrl: URLString;

  constructor(parent: OAuthFlowModelParent, tokenUrl: URLString) {
    super(parent, 'password');
    this.tokenUrl = tokenUrl;
  }
}

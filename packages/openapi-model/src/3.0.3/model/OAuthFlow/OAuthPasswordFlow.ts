import { OAuthFlowBase, OAuthFlowParent } from './OAuthFlowBase';

import type { OAuthPasswordFlowModel } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export class OAuthPasswordFlow extends OAuthFlowBase implements OAuthPasswordFlowModel {
  tokenUrl: URLString;

  constructor(parent: OAuthFlowParent, tokenUrl: URLString) {
    super(parent, 'password');
    this.tokenUrl = tokenUrl;
  }
}

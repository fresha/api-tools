import { OAuthFlows } from '../OAuthFlow';

import { SecuritySchemeBase } from './SecuritySchemeBase';

import type { OAuth2SecuritySchemaModel, SecuritySchemaModelParent, TreeNode } from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class OAuth2SecurityScheme extends SecuritySchemeBase implements OAuth2SecuritySchemaModel {
  declare readonly type: 'oauth2';
  readonly flows: OAuthFlows;

  constructor(parent: SecuritySchemaModelParent) {
    super(parent, 'oauth2');
    this.flows = new OAuthFlows(this);
  }

  *children(): IterableIterator<TreeNode<unknown>> {
    yield this.flows;
  }
}

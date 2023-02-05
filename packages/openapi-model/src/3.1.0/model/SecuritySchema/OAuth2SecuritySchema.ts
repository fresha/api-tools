import { OAuthFlows } from './OAuthFlow/OAuthFlows';
import { SecuritySchemaBase, SecuritySchemaParent } from './SecuritySchemaBase';

import type { OAuth2SecuritySchemaModel } from '../types';

export class OAuth2SecuritySchema extends SecuritySchemaBase implements OAuth2SecuritySchemaModel {
  #flows: OAuthFlows;

  constructor(parent: SecuritySchemaParent) {
    super(parent);
    this.#flows = new OAuthFlows(this);
  }

  // eslint-disable-next-line class-methods-use-this
  get type(): 'oauth2' {
    return 'oauth2';
  }

  get flows(): OAuthFlows {
    return this.#flows;
  }
}

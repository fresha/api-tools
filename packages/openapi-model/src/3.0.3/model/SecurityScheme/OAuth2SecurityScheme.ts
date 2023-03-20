import { OAuthFlows } from '../OAuthFlow';

import { SecuritySchemeBase } from './SecuritySchemeBase';

import type { OAuth2SecuritySchemaModel, SecuritySchemaModelParent } from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class OAuth2SecurityScheme
  extends SecuritySchemeBase<'oauth2'>
  implements OAuth2SecuritySchemaModel
{
  readonly #flows: OAuthFlows;

  constructor(parent: SecuritySchemaModelParent) {
    super(parent, 'oauth2');
    this.#flows = new OAuthFlows(this);
  }

  get flows(): OAuthFlows {
    return this.#flows;
  }
}

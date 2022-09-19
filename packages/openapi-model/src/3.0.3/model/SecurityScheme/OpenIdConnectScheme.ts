import { SecuritySchemeBase, SecuritySchemeParent } from './SecuritySchemeBase';

import type { OpenIDConnectSecuritySchemaModel } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class OpenIdConnectScheme
  extends SecuritySchemeBase
  implements OpenIDConnectSecuritySchemaModel
{
  openIdConnectUrl: URLString;

  constructor(parent: SecuritySchemeParent, openIdConnectUrl: URLString) {
    super(parent);
    this.openIdConnectUrl = openIdConnectUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  get type(): 'openIdConnect' {
    return 'openIdConnect';
  }
}

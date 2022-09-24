import { SecuritySchemeBase } from './SecuritySchemeBase';

import type { OpenIDConnectSecuritySchemaModel, SecuritySchemaModelParent } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class OpenIdConnectSecurityScheme
  extends SecuritySchemeBase
  implements OpenIDConnectSecuritySchemaModel
{
  declare readonly type: 'openIdConnect';
  openIdConnectUrl: URLString;

  constructor(parent: SecuritySchemaModelParent, openIdConnectUrl: URLString) {
    super(parent, 'openIdConnect');
    this.openIdConnectUrl = openIdConnectUrl;
  }
}

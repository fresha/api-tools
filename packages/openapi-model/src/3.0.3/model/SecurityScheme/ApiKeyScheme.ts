import { SecuritySchemeBase, SecuritySchemeParent } from './SecuritySchemeBase';

import type { APIKeySecuritySchemaModel } from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class ApiKeyScheme extends SecuritySchemeBase implements APIKeySecuritySchemaModel {
  name: string;
  in: 'query' | 'header' | 'cookie';

  constructor(parent: SecuritySchemeParent, name: string, location: 'query' | 'header' | 'cookie') {
    super(parent);
    this.name = name;
    this.in = location;
  }

  // eslint-disable-next-line class-methods-use-this
  get type(): 'apiKey' {
    return 'apiKey';
  }
}

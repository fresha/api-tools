import { SecuritySchemeBase } from './SecuritySchemeBase';

import type {
  APIKeySecuritySchemaModel,
  APIKeySecuritySchemaModelLocation,
  SecuritySchemaModelParent,
} from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class APIKeySecurityScheme
  extends SecuritySchemeBase<'apiKey'>
  implements APIKeySecuritySchemaModel
{
  #name: string;
  #in: APIKeySecuritySchemaModelLocation;

  constructor(
    parent: SecuritySchemaModelParent,
    name: string,
    location: APIKeySecuritySchemaModelLocation,
  ) {
    super(parent, 'apiKey');
    this.#name = name;
    this.#in = location;
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    this.#name = value;
  }

  get in(): APIKeySecuritySchemaModelLocation {
    return this.#in;
  }

  set in(value: APIKeySecuritySchemaModelLocation) {
    this.#in = value;
  }
}

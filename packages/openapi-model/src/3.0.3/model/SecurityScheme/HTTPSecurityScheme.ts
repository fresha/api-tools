import { Schema } from '../Schema';

import { SecuritySchemeBase } from './SecuritySchemeBase';

import type { HTTPSecuritySchemaModel, SecuritySchemaModelParent } from '../types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class HTTPSecurityScheme
  extends SecuritySchemeBase<'http'>
  implements HTTPSecuritySchemaModel
{
  #scheme: Schema;
  #bearerFormat: Nullable<string>;

  constructor(parent: SecuritySchemaModelParent, scheme?: Schema) {
    super(parent, 'http');
    this.#scheme = scheme ?? Schema.create(this, null);
    this.#bearerFormat = null;
  }

  get scheme(): Schema {
    return this.#scheme;
  }

  set scheme(value: Schema) {
    this.#scheme = value;
  }

  get bearerFormat(): Nullable<string> {
    return this.#bearerFormat;
  }

  set bearerFormat(value: Nullable<string>) {
    this.#bearerFormat = value;
  }
}

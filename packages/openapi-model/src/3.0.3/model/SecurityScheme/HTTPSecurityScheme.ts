import assert from 'assert';

import { SecuritySchemeBase } from './SecuritySchemeBase';

import type { HTTPAuthSchema, HTTPSecuritySchemaModel, SecuritySchemaModelParent } from '../types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class HTTPSecurityScheme
  extends SecuritySchemeBase<'http'>
  implements HTTPSecuritySchemaModel
{
  #scheme: HTTPAuthSchema;
  #bearerFormat: Nullable<string>;

  constructor(parent: SecuritySchemaModelParent, scheme: HTTPAuthSchema) {
    super(parent, 'http');
    this.#assertScheme(scheme);
    this.#scheme = scheme;
    this.#bearerFormat = null;
  }

  // eslint-disable-next-line class-methods-use-this
  #assertScheme(value: HTTPAuthSchema) {
    assert(
      [
        'basic',
        'bearer',
        'digest',
        'hoba',
        'mutual',
        'negotiate',
        'oauth',
        'scram-sha-1',
        'scram-sha-256',
        'vapid',
      ].includes(value.toLowerCase()),
      `Invalid HTTP Auth Schema: ${value}`,
    );
  }

  get scheme(): HTTPAuthSchema {
    return this.#scheme;
  }

  set scheme(value: HTTPAuthSchema) {
    this.#assertScheme(value);
    this.#scheme = value;
  }

  get bearerFormat(): Nullable<string> {
    return this.#bearerFormat;
  }

  set bearerFormat(value: Nullable<string>) {
    this.#bearerFormat = value;
  }
}

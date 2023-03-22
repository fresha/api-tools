import assert from 'assert';

import isURL from 'validator/lib/isURL';

import { SecuritySchemeBase } from './SecuritySchemeBase';

import type { OpenIDConnectSecuritySchemaModel, SecuritySchemaModelParent } from '../types';
import type { URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class OpenIdConnectSecurityScheme
  extends SecuritySchemeBase<'openIdConnect'>
  implements OpenIDConnectSecuritySchemaModel
{
  #openIdConnectUrl: URLString;

  constructor(parent: SecuritySchemaModelParent, openIdConnectUrl: URLString) {
    super(parent, 'openIdConnect');
    this.#assertUrl(openIdConnectUrl);
    this.#openIdConnectUrl = openIdConnectUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  #assertUrl(value: URLString): void {
    assert(isURL(value), `Invalid URL '${value}'`);
  }

  get openIdConnectUrl(): URLString {
    return this.#openIdConnectUrl;
  }

  set openIdConnectUrl(value: URLString) {
    this.#assertUrl(value);
    this.#openIdConnectUrl = value;
  }
}

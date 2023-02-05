import assert from 'assert';

import { SecuritySchemaBase, SecuritySchemaParent } from './SecuritySchemaBase';

import type { OpenIDConnectSecuritySchemaModel } from '../types';
import type { URLString } from '@fresha/api-tools-core';

export class OpenIDConnectSecuritySchema
  extends SecuritySchemaBase
  implements OpenIDConnectSecuritySchemaModel
{
  #connectUrl: URLString;

  constructor(parent: SecuritySchemaParent, connectUrl: URLString) {
    super(parent);
    this.#connectUrl = connectUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  get type(): 'openIdConnect' {
    return 'openIdConnect';
  }

  get connectUrl(): URLString {
    return this.#connectUrl;
  }

  set connectUrl(value: URLString) {
    assert(value, 'Connect URL for an OpenIDConnect schema cannot be empty');
    this.#connectUrl = value;
  }
}

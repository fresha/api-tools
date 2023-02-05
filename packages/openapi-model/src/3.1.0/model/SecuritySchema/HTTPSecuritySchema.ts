import { SecuritySchemaBase, SecuritySchemaParent } from './SecuritySchemaBase';

import type { HTTPSecuritySchemaAuthentication, HTTPSecuritySchemaModel } from '../types';
import type { Nullable } from '@fresha/api-tools-core';

export class HTTPSecuritySchema extends SecuritySchemaBase implements HTTPSecuritySchemaModel {
  #scheme: HTTPSecuritySchemaAuthentication;
  #bearerFormat: Nullable<string>;

  constructor(parent: SecuritySchemaParent) {
    super(parent);
    this.#scheme = 'Basic';
    this.#bearerFormat = null;
  }

  // eslint-disable-next-line class-methods-use-this
  get type(): 'http' {
    return 'http';
  }

  get scheme(): HTTPSecuritySchemaAuthentication {
    return this.#scheme;
  }

  set scheme(value: HTTPSecuritySchemaAuthentication) {
    this.#scheme = value;
  }

  get bearerFormat(): Nullable<string> {
    return this.#bearerFormat;
  }

  set bearerFormat(value: Nullable<string>) {
    this.#bearerFormat = value;
  }
}

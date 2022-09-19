import { Schema } from '../Schema';

import { SecuritySchemeBase, SecuritySchemeParent } from './SecuritySchemeBase';

import type { HTTPSecuritySchemaModel } from '../types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class HttpScheme extends SecuritySchemeBase implements HTTPSecuritySchemaModel {
  scheme: Schema;
  bearerFormat: Nullable<string>;

  constructor(parent: SecuritySchemeParent, scheme?: Schema) {
    super(parent);
    this.scheme = scheme ?? new Schema(this);
    this.bearerFormat = null;
  }

  // eslint-disable-next-line class-methods-use-this
  get type(): 'http' {
    return 'http';
  }
}

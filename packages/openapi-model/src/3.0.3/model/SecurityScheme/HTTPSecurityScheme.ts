import { Schema, SchemaFactory } from '../Schema';

import { SecuritySchemeBase } from './SecuritySchemeBase';

import type { HTTPSecuritySchemaModel, SchemaModel, SecuritySchemaModelParent, TreeNode } from '../types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class HTTPSecurityScheme extends SecuritySchemeBase implements HTTPSecuritySchemaModel {
  declare readonly type: 'http';
  scheme: SchemaModel;
  bearerFormat: Nullable<string>;

  constructor(parent: SecuritySchemaModelParent, scheme?: Schema) {
    super(parent, 'http');
    this.scheme = scheme ?? SchemaFactory.create(this, null);
    this.bearerFormat = null;
  }

  // eslint-disable-next-line class-methods-use-this
  *children(): IterableIterator<TreeNode<unknown>> {

  }
}

import { SchemaBase, SchemaParent } from './SchemaBase';

import type { Nullable } from '@fresha/api-tools-core';

export class NumberSchema extends SchemaBase {
  enum: Nullable<number[]>;
  maximum: Nullable<number>;
  exclusiveMaximum: boolean;
  minimum: Nullable<number>;
  exclusiveMinimum: boolean;
  multipleOf: Nullable<number>;

  constructor(parent: SchemaParent) {
    super(parent, 'number');
    this.enum = null;
    this.maximum = null;
    this.exclusiveMaximum = false;
    this.minimum = null;
    this.exclusiveMinimum = false;
    this.multipleOf = null;
  }

  declare readonly type: 'number';
}

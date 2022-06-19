import { SchemaBase, SchemaParent } from './SchemaBase';

import type { AddNumberSchemaOptions, INumberSchema } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export class NumberSchema extends SchemaBase implements INumberSchema {
  allowed: Nullable<number[]>;
  maximum: Nullable<number>;
  exclusiveMaximum: boolean;
  minimum: Nullable<number>;
  exclusiveMinimum: boolean;
  multipleOf: Nullable<number>;

  constructor(parent: SchemaParent, options?: AddNumberSchemaOptions) {
    super(parent, 'number');
    this.allowed = options?.allowed?.length ? options.allowed.slice() : null;
    this.maximum = options?.maximum ?? null;
    this.exclusiveMaximum = options?.exclusiveMaximum ?? false;
    this.minimum = options?.minimum ?? null;
    this.exclusiveMinimum = options?.exclusiveMinimum ?? false;
    this.multipleOf = options?.multipleOf ?? null;
  }

  declare readonly type: 'number';
}

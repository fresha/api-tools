import { SchemaBase, SchemaParent } from './SchemaBase';

import type { IStringSchema } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export class StringSchema extends SchemaBase implements IStringSchema {
  enum: Nullable<string[]>;
  maxLength: Nullable<number>;
  minLength: Nullable<number>;
  pattern: Nullable<string>;

  constructor(parent: SchemaParent) {
    super(parent, 'string');
    this.enum = null;
    this.maxLength = null;
    this.minLength = null;
    this.pattern = null;
  }

  declare readonly type: 'string';
}

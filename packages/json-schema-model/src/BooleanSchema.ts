import { SchemaBase, SchemaParent } from './SchemaBase';

import type { IBooleanSchema } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export class BooleanSchema extends SchemaBase implements IBooleanSchema {
  enum: Nullable<boolean[]>;

  constructor(parent: SchemaParent) {
    super(parent, 'boolean');
    this.enum = null;
  }

  declare readonly type: 'boolean';
}

import { SchemaBase, SchemaParent } from './SchemaBase';

import type { AddBooleanSchemaOptions, IBooleanSchema } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export class BooleanSchema extends SchemaBase implements IBooleanSchema {
  allowed: Nullable<boolean[]>;

  constructor(parent: SchemaParent, options?: AddBooleanSchemaOptions) {
    super(parent, 'boolean');
    this.allowed = options?.allowed?.length ? options.allowed.slice() : null;
  }

  declare readonly type: 'boolean';
}

import { SchemaBase, SchemaParent } from './SchemaBase';

import type { AddStringSchemaOptions, IStringSchema } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export class StringSchema extends SchemaBase implements IStringSchema {
  allowed: Nullable<string[]>;
  maxLength: Nullable<number>;
  minLength: Nullable<number>;
  pattern: Nullable<string>;

  constructor(parent: SchemaParent, options?: AddStringSchemaOptions) {
    super(parent, 'string');
    this.allowed = options?.allowed?.length ? options.allowed.slice() : null;
    this.maxLength = options?.maxLength ?? null;
    this.minLength = options?.minLength ?? null;
    this.pattern = options?.pattern ?? null;
  }

  declare readonly type: 'string';
}

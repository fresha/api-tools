import { ObjectSchema } from './ObjectSchema';
import { SchemaBase, SchemaParent } from './SchemaBase';

import type { INotSchema, JSONSchemaOrReference } from './types';

export class NotSchema extends SchemaBase implements INotSchema {
  baseSchema: JSONSchemaOrReference;

  constructor(parent: SchemaParent) {
    super(parent, 'not');
    this.baseSchema = new ObjectSchema(this);
  }

  declare readonly type: 'not';
}

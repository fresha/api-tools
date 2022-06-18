import { ObjectSchema } from './ObjectSchema';
import { SchemaBase, SchemaParent } from './SchemaBase';

import type { IArraySchema, JSONSchemaOrReference } from './types';

export class ArraySchema extends SchemaBase implements IArraySchema {
  itemSchema: JSONSchemaOrReference;

  constructor(parent: SchemaParent) {
    super(parent, 'array');
    this.itemSchema = new ObjectSchema(this);
  }

  declare readonly type: 'array';
}

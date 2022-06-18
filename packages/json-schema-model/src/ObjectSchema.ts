import { SchemaBase, SchemaParent } from './SchemaBase';

import type { IObjectSchema, JSONSchemaOrReference } from './types';

export class ObjectSchema extends SchemaBase implements IObjectSchema {
  readonly properties: Map<string, JSONSchemaOrReference>;
  required: string[];
  additionalProperties: JSONSchemaOrReference | boolean;

  constructor(parent: SchemaParent) {
    super(parent, 'object');
    this.properties = new Map<string, JSONSchemaOrReference>();
    this.required = [];
    this.additionalProperties = true;
  }

  declare readonly type: 'object';
}

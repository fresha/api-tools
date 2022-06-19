import { SchemaBase, SchemaParent } from './SchemaBase';

import type { IAnyOfSchema, JSONSchemaOrReference } from './types';

export class AnyOfSchema extends SchemaBase implements IAnyOfSchema {
  readonly alternatives: JSONSchemaOrReference[];

  constructor(parent: SchemaParent, ...alternatives: JSONSchemaOrReference[]) {
    super(parent, 'anyOf');
    this.alternatives = [...alternatives];
  }

  declare readonly type: 'anyOf';
}

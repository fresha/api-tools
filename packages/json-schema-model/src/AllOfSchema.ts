import { SchemaBase, SchemaParent } from './SchemaBase';

import type { IAllOfSchema, JSONSchemaOrReference } from './types';

export class AllOfSchema extends SchemaBase implements IAllOfSchema {
  readonly alternatives: JSONSchemaOrReference[];

  constructor(parent: SchemaParent, ...alternatives: JSONSchemaOrReference[]) {
    super(parent, 'allOf');
    this.alternatives = [...alternatives];
  }

  declare readonly type: 'allOf';
}

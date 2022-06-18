import { SchemaBase, SchemaParent } from './SchemaBase';

import type { IOneOfSchema, JSONSchemaOrReference } from './types';

export class OneOfSchema extends SchemaBase implements IOneOfSchema {
  readonly alternatives: JSONSchemaOrReference[];

  constructor(parent: SchemaParent, ...alternatives: JSONSchemaOrReference[]) {
    super(parent, 'oneOf');
    this.alternatives = [...alternatives];
  }

  declare readonly type: 'oneOf';
}

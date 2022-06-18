import { ITreeParent } from '@fresha/api-tools-core/build/TreeNode';

import { AllOfSchema } from './AllOfSchema';
import { AnyOfSchema } from './AnyOfSchema';
import { NotSchema } from './NotSchema';
import { OneOfSchema } from './OneOfSchema';

import type {
  IAllOfSchema,
  IAnyOfSchema,
  INotSchema,
  IOneOfSchema,
  ISchemaRegistry,
  JSONSchemaOrReference,
} from './types';

class Registry implements ISchemaRegistry, ITreeParent<ISchemaRegistry> {
  readonly schemas: Map<string, JSONSchemaOrReference>;

  constructor() {
    this.schemas = new Map<string, JSONSchemaOrReference>();
  }

  get root(): ISchemaRegistry {
    return this;
  }

  allOf(...alts: JSONSchemaOrReference[]): IAllOfSchema {
    const result = new AllOfSchema(this, ...alts);
    return result;
  }

  anyOf(...alts: JSONSchemaOrReference[]): IAnyOfSchema {
    const result = new AnyOfSchema(this, ...alts);
    return result;
  }

  oneOf(...alts: JSONSchemaOrReference[]): IOneOfSchema {
    const result = new OneOfSchema(this, ...alts);
    return result;
  }

  not(base: JSONSchemaOrReference): INotSchema {
    const result = new NotSchema(this);
    result.baseSchema = base;
    return result;
  }
}

export const createSchemaRegistry = (): ISchemaRegistry => new Registry();

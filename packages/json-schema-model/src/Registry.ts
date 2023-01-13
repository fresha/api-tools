import { ITreeParent } from '@fresha/api-tools-core/build/TreeNode';

import { AllOfSchema } from './AllOfSchema';
import { AnyOfSchema } from './AnyOfSchema';
import { ArraySchema } from './ArraySchema';

import type {
  AddBooleanSchemaOptions,
  AddNumberSchemaOptions,
  AddStringSchemaOptions,
  IAllOfSchema,
  IAnyOfSchema,
  IArraySchema,
  IBooleanSchema,
  INotSchema,
  INumberSchema,
  IObjectSchema,
  IOneOfSchema,
  ISchemaRegistry,
  IStringSchema,
  JSONSchema,
  JSONSchemaOrReference,
  JSONSchemaType,
} from './types';

import { BooleanSchema } from './BooleanSchema';
import { NotSchema } from './NotSchema';
import { NumberSchema } from './NumberSchema';
import { ObjectSchema } from './ObjectSchema';
import { OneOfSchema } from './OneOfSchema';
import { StringSchema } from './StringSchema';

class Registry implements ISchemaRegistry, ITreeParent<ISchemaRegistry> {
  readonly schemas: Map<string, JSONSchema>;

  constructor() {
    this.schemas = new Map<string, JSONSchema>();
  }

  get root(): ISchemaRegistry {
    return this;
  }

  add(type: 'boolean', options?: AddBooleanSchemaOptions): IBooleanSchema;
  add(type: 'number', options?: AddNumberSchemaOptions): INumberSchema;
  add(type: 'string', options?: AddStringSchemaOptions): IStringSchema;
  add(type: 'object'): IObjectSchema;
  add(type: 'array'): IArraySchema;
  add(
    type: JSONSchemaType,
    options?: AddBooleanSchemaOptions | AddNumberSchemaOptions | AddStringSchemaOptions,
  ): JSONSchema {
    switch (type) {
      case 'boolean': {
        const result = new BooleanSchema(this, options as AddBooleanSchemaOptions);
        this.schemas.set(result.id, result);
        return result;
      }
      case 'number': {
        const result = new NumberSchema(this, options as AddNumberSchemaOptions);
        this.schemas.set(result.id, result);
        return result;
      }
      case 'string': {
        const result = new StringSchema(this, options as AddStringSchemaOptions);
        this.schemas.set(result.id, result);
        return result;
      }
      case 'object': {
        const result = new ObjectSchema(this);
        this.schemas.set(result.id, result);
        return result;
      }
      case 'array': {
        const result = new ArraySchema(this);
        this.schemas.set(result.id, result);
        return result;
      }
      default:
        throw new Error(`Unsupported schema type ${type}`);
    }
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

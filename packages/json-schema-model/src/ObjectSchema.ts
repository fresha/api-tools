import { SchemaBase, SchemaParent } from './SchemaBase';

import type {
  AddBooleanPropertyOptions,
  AddNumberPropertyOptions,
  AddStringPropertyOptions,
  IArraySchema,
  IBooleanSchema,
  INumberSchema,
  IObjectSchema,
  IStringSchema,
  JSONSchema,
  JSONSchemaOrReference,
  JSONSchemaType,
} from './types';

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

  addProperty(name: string, type: 'boolean', options?: AddBooleanPropertyOptions): IBooleanSchema;
  addProperty(name: string, type: 'number', options?: AddNumberPropertyOptions): INumberSchema;
  addProperty(name: string, type: 'string', options?: AddStringPropertyOptions): IStringSchema;
  addProperty(name: string, type: 'object'): IObjectSchema;
  addProperty(name: string, type: 'array'): IArraySchema;
  addProperty(
    name: string,
    type: JSONSchemaType,
    options?: AddBooleanPropertyOptions | AddNumberPropertyOptions | AddStringPropertyOptions,
  ): JSONSchema {
    switch (type) {
      case 'boolean': {
        const result = this.root.add('boolean', options as AddBooleanPropertyOptions);
        this.properties.set(name, result);
        return result;
      }
      case 'number': {
        const result = this.root.add('number', options as AddNumberPropertyOptions);
        this.properties.set(name, result);
        return result;
      }
      case 'string': {
        const result = this.root.add('string', options as AddStringPropertyOptions);
        this.properties.set(name, result);
        return result;
      }
      case 'object': {
        const result = this.root.add('object');
        this.properties.set(name, result);
        return result;
      }
      case 'array': {
        const result = this.root.add('array');
        this.properties.set(name, result);
        return result;
      }
      default:
        throw new Error(`Unsupported schema type ${type}`);
    }
  }

  removeProperty(name: string): void {
    this.properties.delete(name);
  }

  clearProperties(): void {
    this.properties.clear();
  }
}

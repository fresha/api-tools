import assert from 'assert';

import { BasicNode } from './BasicNode';

import type {
  DiscriminatorModel,
  ExternalDocumentationModel,
  SchemaCreateArrayObject,
  SchemaCreateArrayOptions,
  CreateOrSetSchemaOptions,
  CreateSchemaOptions,
  SchemaFormat,
  SchemaModel,
  SchemaModelFactory,
  SchemaModelParent,
  CreateSchemaPropertyOptions,
  SchemaPropertyObject,
  SchemaType,
  XMLModel,
} from './types';
import type { CommonMarkString, JSONValue, Nullable } from '@fresha/api-tools-core';

export const isSchemaModel = (obj: unknown): obj is SchemaModel => {
  return !!(
    obj &&
    typeof obj === 'object' &&
    'isComposite' in obj &&
    typeof obj.isComposite === 'function'
  );
};

export const isSchemaModelType = (obj: unknown): obj is { type: SchemaModel } => {
  return !!(obj && typeof obj === 'object' && 'type' in obj && isSchemaModel(obj.type));
};

/**
 * @see http://spec.openapis.org/oas/v3.0.3#schema-object
 */
export class Schema extends BasicNode<SchemaModelParent> implements SchemaModel {
  title: Nullable<string>;
  multipleOf: Nullable<number>;
  maximum: Nullable<number>;
  exclusiveMaximum: Nullable<number>;
  minimum: Nullable<number>;
  exclusiveMinimum: Nullable<number>;
  maxLength: Nullable<number>;
  minLength: Nullable<number>;
  pattern: Nullable<string>;
  maxItems: Nullable<number>;
  minItems: Nullable<number>;
  uniqueItems: boolean;
  maxProperties: Nullable<number>;
  minProperties: Nullable<number>;
  required: Set<string>;
  enum: Nullable<JSONValue[]>;
  type: Nullable<SchemaType>;
  readonly allOf: SchemaModel[];
  readonly oneOf: SchemaModel[];
  readonly anyOf: SchemaModel[];
  not: Nullable<SchemaModel>;
  items: Nullable<SchemaModel>;
  readonly properties: Map<string, SchemaModel>;
  additionalProperties: Nullable<SchemaModel | boolean>;
  description: Nullable<CommonMarkString>;
  format: Nullable<SchemaFormat>;
  default: Nullable<JSONValue>;
  nullable: boolean;
  discriminator: Nullable<DiscriminatorModel>;
  readOnly: boolean;
  writeOnly: boolean;
  xml: Nullable<XMLModel>;
  externalDocs: Nullable<ExternalDocumentationModel>;
  example: Nullable<JSONValue>;
  deprecated: boolean;

  static create(parent: SchemaModelParent, params: CreateSchemaOptions = null): Schema {
    const result = new Schema(parent);

    const resolvedType = params == null || typeof params === 'string' ? params : params.type;
    switch (resolvedType) {
      case null:
        break;
      case 'boolean':
      case 'object':
      case 'array':
      case 'integer':
      case 'number':
      case 'string':
        result.type = resolvedType;
        break;
      case 'int32':
      case 'int64':
        result.type = 'integer';
        result.format = resolvedType;
        break;
      case 'float':
      case 'double':
        result.type = 'number';
        result.format = resolvedType;
        break;
      case 'byte':
      case 'binary':
      case 'date':
      case 'date-time':
      case 'password':
      case 'email':
      case 'decimal':
        result.type = 'string';
        result.format = resolvedType;
        break;
      default:
        assert.fail(`Unsupported schema create type ${String(resolvedType)}`);
    }

    if (params && typeof params !== 'string') {
      if (params.nullable != null) {
        result.nullable = params.nullable;
      }
      if (params.readOnly != null) {
        result.readOnly = params.readOnly;
      }
      if (params.writeOnly != null) {
        result.writeOnly = params.writeOnly;
      }

      switch (params.type) {
        case null:
          break;
        case 'boolean': {
          if (params.enum?.includes(true)) {
            if (!params.enum?.includes(false)) {
              result.enum = [true];
            }
          } else if (params.enum?.includes(false)) {
            result.enum = [false];
          }
          if (params.default != null) {
            assert(result.enum == null || result.enum.includes(!!params.default));
            result.default = !!params.default;
          }
          break;
        }
        case 'integer':
        case 'int32':
        case 'int64':
        case 'number': {
          if (params.enum?.length) {
            result.enum = params.enum.slice();
          }
          if (params.default != null) {
            assert(result.enum == null || result.enum.includes(params.default));
            result.default = params.default;
          }
          if (params.minimum != null) {
            result.minimum = params.minimum;
          }
          if (params.maximum != null) {
            result.maximum = params.maximum;
          }
          if (params.exclusiveMinimum != null) {
            result.exclusiveMinimum = params.exclusiveMinimum;
          }
          if (params.exclusiveMaximum != null) {
            result.exclusiveMaximum = params.exclusiveMaximum;
          }
          break;
        }
        case 'date':
        case 'date-time':
        case 'email':
        case 'decimal': {
          if (params.enum?.length) {
            result.enum = params.enum.slice();
          }
          if (params.default != null) {
            assert(result.enum == null || result.enum.includes(params.default));
            result.default = params.default;
          }
          break;
        }
        case 'string': {
          if (params.enum?.length) {
            result.enum = params.enum.slice();
          }
          if (params.default != null) {
            assert(result.enum == null || result.enum.includes(params.default));
            result.default = params.default;
          }
          if (params.pattern != null) {
            result.pattern = params.pattern;
          }
          if (params.minLength != null) {
            result.minLength = params.minLength;
          }
          if (params.maxLength != null) {
            result.maxLength = params.maxLength;
          }
          break;
        }
        case 'object': {
          if (params.properties) {
            result.setProperties(params.properties);
          }
          break;
        }
        case 'array': {
          if (params.items) {
            result.setItems(params.items);
          }
          break;
        }
        default:
          assert.fail(`Unsupported schema create type ${String(params)}`);
      }
    }

    return result;
  }

  static createOrGet(parent: SchemaModel, options: CreateOrSetSchemaOptions): Schema {
    if (isSchemaModel(options)) {
      return options as Schema;
    }
    if (isSchemaModelType(options)) {
      return options.type as Schema;
    }
    return this.create(parent, options);
  }

  static createArray(parent: SchemaModelParent, options: SchemaCreateArrayOptions): Schema {
    const result = Schema.create(parent, 'array');

    if (typeof options === 'string' || options == null) {
      result.items = Schema.create(result, options);
    } else if (options instanceof Schema) {
      result.items = options;
    } else {
      const { itemsOptions } = options as SchemaCreateArrayObject;
      if (typeof itemsOptions === 'string' || itemsOptions == null) {
        result.items = Schema.create(result, itemsOptions);
      } else if (itemsOptions instanceof Schema) {
        result.items = itemsOptions;
      } else {
        assert.fail(`Unsupported schema type ${String(itemsOptions)}`);
      }
      if (options.minItems) {
        result.minItems = options.minItems;
      }
      if (options.maxItems) {
        result.maxItems = options.maxItems;
      }
    }
    return result;
  }

  static createObject(
    parent: SchemaModelParent,
    props: Record<string, CreateSchemaPropertyOptions>,
  ): Schema {
    const result = Schema.create(parent, 'object');
    result.setProperties(props);
    return result;
  }

  constructor(parent: SchemaModelParent) {
    super(parent);
    this.title = null;
    this.multipleOf = null;
    this.maximum = null;
    this.exclusiveMaximum = null;
    this.minimum = null;
    this.exclusiveMinimum = null;
    this.minLength = null;
    this.maxLength = null;
    this.pattern = null;
    this.minItems = null;
    this.maxItems = null;
    this.uniqueItems = false;
    this.minProperties = null;
    this.maxProperties = null;
    this.required = new Set<string>();
    this.enum = null;
    this.type = null;
    this.allOf = [];
    this.oneOf = [];
    this.anyOf = [];
    this.not = null;
    this.items = null;
    this.properties = new Map<string, SchemaModel>();
    this.additionalProperties = true;
    this.description = null;
    this.format = null;
    this.default = null;
    this.nullable = false;
    this.discriminator = null;
    this.readOnly = false;
    this.writeOnly = false;
    this.xml = null;
    this.externalDocs = null;
    this.example = null;
    this.deprecated = false;
  }

  isComposite(): boolean {
    return !!(this.allOf.length || this.oneOf.length || this.anyOf.length);
  }

  isNull(): boolean {
    return !!(this.type === null && this.enum?.length === 1 && this.enum[0] === null);
  }

  isNullish(): boolean {
    return !!(
      this.nullable ||
      this.isNull() ||
      this.allOf.some(s => s.isNullish()) ||
      this.oneOf.some(s => s.isNullish()) ||
      this.anyOf.some(s => s.isNullish())
    );
  }

  *getProperties(): IterableIterator<SchemaPropertyObject> {
    for (const [name, schema] of this.properties) {
      yield { name, schema, required: this.isPropertyRequired(name) };
    }
  }

  getProperty(name: string): SchemaModel | undefined {
    return this.properties.get(name);
  }

  getPropertyOrThrow(name: string): SchemaModel {
    const result = this.getProperty(name);
    assert(result, `Expected to find property ${name}, but got none`);
    return result;
  }

  *getPropertiesDeep(): IterableIterator<SchemaPropertyObject> {
    // here we should iterate over any kind of schemas
    for (const prop of this.getProperties()) {
      yield prop;
    }
    for (const subschema of this.allOf) {
      for (const subprop of subschema.getProperties()) {
        yield subprop;
      }
    }
  }

  getPropertyDeep(name: string): SchemaModel | undefined {
    if (this.type === 'object') {
      const prop = this.getProperty(name);
      if (prop) {
        return prop;
      }
    }
    for (const subschema of this.allOf) {
      if (subschema.type === 'object') {
        const prop = subschema.getProperty(name);
        if (prop) {
          return prop;
        }
      }
    }
    return undefined;
  }

  getPropertyDeepOrThrow(name: string): SchemaModel {
    const result = this.getPropertyDeep(name);
    assert(result, `Expected to find (deep) property ${name}, but got none`);
    return result;
  }

  setProperty(name: string, params: CreateSchemaPropertyOptions): SchemaModel {
    let propertySchema: SchemaModel;
    let propertyRequired: boolean | undefined;

    if (params == null || typeof params === 'string') {
      propertySchema = Schema.create(this, params);
    } else if (isSchemaModel(params)) {
      propertySchema = params;
    } else {
      if (params.type == null || typeof params.type === 'string') {
        propertySchema = Schema.create(this, params);
      } else if (isSchemaModelType(params)) {
        propertySchema = params.type;
      } else {
        assert.fail(`Unsupported type ${String(params)} for property '${name}'`);
      }
      propertyRequired = params.required;
    }

    this.properties.set(name, propertySchema);

    if (propertyRequired != null) {
      this.setPropertyRequired(name, propertyRequired);
    }

    return propertySchema;
  }

  setProperties(props: Record<string, CreateSchemaPropertyOptions>): Schema {
    for (const [propName, propDef] of Object.entries(props)) {
      this.setProperty(propName, propDef);
    }
    return this;
  }

  deleteProperty(name: string): void {
    this.properties.delete(name);
    this.required.delete(name);
  }

  clearProperties(): void {
    this.properties.clear();
    this.required.clear();
  }

  isPropertyRequired(name: string): boolean {
    return this.required.has(name);
  }

  setPropertyRequired(name: string, value: boolean): void {
    if (value) {
      this.required.add(name);
    } else {
      this.required.delete(name);
    }
  }

  setItems(options: CreateOrSetSchemaOptions): SchemaModel {
    assert(!this.items, `This schema's items have already been set`);
    this.items = isSchemaModel(options) ? options : Schema.create(this, options);
    return this.items;
  }

  addAllOf(typeOrSchema: CreateOrSetSchemaOptions): SchemaModel {
    const schema = isSchemaModel(typeOrSchema) ? typeOrSchema : Schema.create(this, typeOrSchema);
    this.allOf.push(schema);
    return schema;
  }

  deleteAllOfAt(index: number): void {
    this.allOf.splice(index, 1);
  }

  clearAllOf(): void {
    this.allOf.splice(0, this.allOf.length);
  }

  addOneOf(typeOrSchema: CreateOrSetSchemaOptions): SchemaModel {
    const schema = isSchemaModel(typeOrSchema) ? typeOrSchema : Schema.create(this, typeOrSchema);
    this.oneOf.push(schema);
    return schema;
  }

  deleteOneOfAt(index: number): void {
    this.oneOf.splice(index, 1);
  }

  clearOneOf(): void {
    this.oneOf.splice(0, this.oneOf.length);
  }

  addAnyOf(typeOrSchema: CreateOrSetSchemaOptions): SchemaModel {
    const schema = isSchemaModel(typeOrSchema) ? typeOrSchema : Schema.create(this, typeOrSchema);
    this.anyOf.push(schema);
    return schema;
  }

  deleteAnyOfAt(index: number): void {
    this.anyOf.splice(index, 1);
  }

  clearAnyOf(): void {
    this.anyOf.splice(0, this.anyOf.length);
  }

  arrayOf(parent: SchemaModelParent): SchemaModel {
    return Schema.createArray(parent, this);
  }
}

export const SchemaFactory: SchemaModelFactory = Schema;

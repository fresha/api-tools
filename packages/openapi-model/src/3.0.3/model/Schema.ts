import assert from 'assert';

import { BasicNode } from './BasicNode';

import type {
  DiscriminatorModel,
  ExternalDocumentationModel,
  SchemaCreateArrayObject,
  SchemaCreateArrayOptions,
  SchemaCreateOptions,
  SchemaCreateType,
  SchemaFormat,
  SchemaModel,
  SchemaModelFactory,
  SchemaModelParent,
  SchemaType,
  XMLModel,
} from './types';
import type { CommonMarkString, JSONValue, Nullable } from '@fresha/api-tools-core';

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
  readonly enum: Nullable<JSONValue[]>;
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

  static create(parent: SchemaModelParent, params: SchemaCreateType = null): Schema {
    const result = new Schema(parent);
    switch (params) {
      case null:
        break;
      case 'boolean':
      case 'object':
      case 'array':
      case 'integer':
      case 'number':
      case 'string':
        result.type = params;
        break;
      case 'int32':
      case 'int64':
        result.type = 'integer';
        result.format = params;
        break;
      case 'float':
      case 'double':
        result.type = 'number';
        result.format = params;
        break;
      case 'byte':
      case 'binary':
      case 'date':
      case 'date-time':
      case 'password':
        result.type = 'string';
        result.format = params;
        break;
      default:
        assert.fail(`Unsupported schema create type ${String(params)}`);
    }
    return result;
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
    props: Record<string, SchemaCreateOptions>,
  ): Schema {
    const result = Schema.create(parent, 'object');
    result.setProperties(props);
    return result;
  }

  private static internalCreate(
    parent: SchemaModelParent,
    params: SchemaCreateOptions,
  ): SchemaModel {
    let propertyType: SchemaCreateType | SchemaModel = null;
    if (typeof params === 'string' || params instanceof Schema) {
      propertyType = params;
    } else if (params && typeof params === 'object') {
      propertyType = params.type;
    }
    return propertyType instanceof Schema
      ? propertyType
      : Schema.create(parent, propertyType as SchemaCreateType);
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

  getProperty(name: string): SchemaModel | undefined {
    return this.properties.get(name);
  }

  getPropertyOrThrow(name: string): SchemaModel {
    const result = this.getProperty(name);
    assert(result);
    return result;
  }

  setProperty(name: string, params: SchemaCreateOptions): SchemaModel {
    const propertySchema = Schema.internalCreate(this, params);
    this.properties.set(name, propertySchema);
    if (params != null && typeof params === 'object' && typeof params.required === 'boolean') {
      this.setPropertyRequired(name, params.required);
    }
    return propertySchema;
  }

  setProperties(
    props: Record<string, SchemaCreateType | SchemaCreateOptions | SchemaModel>,
  ): Schema {
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

  setPropertyRequired(name: string, value: boolean): void {
    if (value) {
      this.required.add(name);
    } else {
      this.required.delete(name);
    }
  }

  addAllOf(typeOrSchema: SchemaCreateOptions): SchemaModel {
    const schema = Schema.internalCreate(this, typeOrSchema);
    this.allOf.push(schema);
    return schema;
  }

  deleteAllOfAt(index: number): void {
    this.allOf.splice(index, 1);
  }

  clearAllOf(): void {
    this.allOf.splice(0, this.allOf.length);
  }

  addOneOf(typeOrSchema: SchemaCreateOptions): SchemaModel {
    const schema = Schema.internalCreate(this, typeOrSchema);
    this.oneOf.push(schema);
    return schema;
  }

  deleteOneOfAt(index: number): void {
    this.oneOf.splice(index, 1);
  }

  clearOneOf(): void {
    this.oneOf.splice(0, this.oneOf.length);
  }

  arrayOf(parent: SchemaModelParent): SchemaModel {
    return Schema.createArray(parent, this);
  }
}

export const SchemaFactory: SchemaModelFactory = Schema;

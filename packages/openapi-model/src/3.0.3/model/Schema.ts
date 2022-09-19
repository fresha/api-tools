import assert from 'assert';

import { BasicNode } from './BasicNode';

import type { SchemaFormat, SchemaType } from '../types';
import type { Components } from './Components';
import type { Discriminator } from './Discriminator';
import type { ExternalDocumentation } from './ExternalDocumentation';
import type { Header } from './Header';
import type { MediaType } from './MediaType';
import type { Parameter } from './Parameter';
import type { HttpScheme } from './SecurityScheme/HttpScheme';
import type {
  SchemaCreateArrayParams,
  SchemaCreatePropertyParams,
  SchemaCreateType,
  SchemaModel,
  SchemaModelFactory,
} from './types';
import type { XML } from './XML';
import type { CommonMarkString, JSONValue, Nullable } from '@fresha/api-tools-core';

export type SchemaParent = Components | MediaType | Parameter | Header | Schema | HttpScheme;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#schema-object
 */
export class Schema extends BasicNode<SchemaParent> implements SchemaModel {
  title: Nullable<string>;
  multipleOf: Nullable<number>;
  maximum: Nullable<number>;
  exclusiveMaximum: boolean;
  minimum: Nullable<number>;
  exclusiveMinimum: boolean;
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
  allOf: Nullable<SchemaModel[]>;
  oneOf: Nullable<SchemaModel[]>;
  anyOf: Nullable<SchemaModel[]>;
  not: Nullable<SchemaModel>;
  items: Nullable<SchemaModel>;
  readonly properties: Map<string, SchemaModel>;
  additionalProperties: Nullable<SchemaModel | boolean>;
  description: Nullable<CommonMarkString>;
  format: Nullable<SchemaFormat>;
  default: Nullable<JSONValue>;
  nullable: boolean;
  discriminator: Nullable<Discriminator>;
  readOnly: boolean;
  writeOnly: boolean;
  xml: Nullable<XML>;
  externalDocs: Nullable<ExternalDocumentation>;
  example: Nullable<JSONValue>;
  deprecated: boolean;

  static create(parent: SchemaParent, params: SchemaCreateType = null): Schema {
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

  static createArray(
    parent: SchemaParent,
    params: SchemaCreateType | SchemaCreateArrayParams | Schema,
  ): Schema {
    const result = Schema.create(parent, 'array');

    if (typeof params === 'string' || params == null) {
      result.items = Schema.create(result, params);
    } else if (params instanceof Schema) {
      result.items = params;
    } else {
      if (typeof params.type === 'string' || params.type == null) {
        result.items = Schema.create(result, params.type);
      } else if (params.type instanceof Schema) {
        result.items = params.type;
      } else {
        assert.fail(`Unsupported schema type ${String(params.type)}`);
      }

      if (params.minItems) {
        result.minItems = params.minItems;
      }
      if (params.maxItems) {
        result.maxItems = params.maxItems;
      }
    }
    return result;
  }

  static createObject(
    parent: SchemaParent,
    props: Record<string, SchemaCreateType | SchemaCreatePropertyParams>,
  ): Schema {
    const result = Schema.create(parent, 'object');
    result.setProperties(props);
    return result;
  }

  constructor(parent: SchemaParent) {
    super(parent);
    this.title = null;
    this.multipleOf = null;
    this.maximum = null;
    this.exclusiveMaximum = false;
    this.minimum = null;
    this.exclusiveMinimum = false;
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
    this.allOf = null;
    this.oneOf = null;
    this.anyOf = null;
    this.not = null;
    this.items = null;
    this.properties = new Map<string, Schema>();
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

  setProperty(name: string, params: SchemaCreateType | SchemaCreatePropertyParams): Schema {
    const propertySchema = Schema.create(
      this,
      typeof params === 'string' || params == null ? params : params.type,
    );
    this.properties.set(name, propertySchema);
    if (typeof params !== 'string' && params != null && params.required) {
      this.required.add(name);
    }
    return propertySchema;
  }

  setProperties(props: Record<string, SchemaCreateType | SchemaCreatePropertyParams>): Schema {
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

  addAllOf(typeOrSchema: SchemaCreateType | SchemaModel): SchemaModel {
    if (this.allOf == null) {
      this.allOf = [];
    }
    if (typeOrSchema == null || typeof typeOrSchema === 'string') {
      const schema = Schema.create(this, typeOrSchema);
      this.allOf.push(schema);
      return schema;
    }
    this.allOf.push(typeOrSchema);
    return typeOrSchema;
  }

  deleteAllOfAt(index: number): void {
    if (this.allOf) {
      this.allOf.splice(index, 1);
      if (!this.allOf.length) {
        this.allOf = null;
      }
    }
  }

  clearAllOf(): void {
    if (this.allOf) {
      for (const item of this.allOf) {
        item.dispose();
      }
      this.allOf = null;
    }
  }

  arrayOf(parent: SchemaParent): SchemaModel {
    return Schema.createArray(parent, this);
  }
}

export const SchemaFactory: SchemaModelFactory = Schema;

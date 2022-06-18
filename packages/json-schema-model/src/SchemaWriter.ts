import { JSONObject } from '@fresha/api-tools-core';

import { AllOfSchema } from './AllOfSchema';
import { AnyOfSchema } from './AnyOfSchema';
import { ArraySchema } from './ArraySchema';
import { BooleanSchema } from './BooleanSchema';
import { NotSchema } from './NotSchema';
import { NumberSchema } from './NumberSchema';
import { ObjectSchema } from './ObjectSchema';
import { OneOfSchema } from './OneOfSchema';
import { StringSchema } from './StringSchema';

import type { ExtensionFields, JSONSchema, JSONSchemaOrReference } from './types';

export class SchemaWriter {
  private writeSchema(schema: JSONSchemaOrReference): JSONObject {
    const isSchema = (arg: JSONSchemaOrReference): arg is JSONSchema =>
      Object.prototype.hasOwnProperty.call(arg, 'type');

    const result = this.writeExtensionFields(schema.extensionFields);
    if (!isSchema(schema)) {
      result.$ref = schema.ref;
    } else {
      this.writeSchemaCommon(result, schema);

      switch (schema.type) {
        case 'allOf':
          this.writeAllOfSchema(result, schema);
          break;
        case 'anyOf':
          this.writeAnyOfSchema(result, schema);
          break;
        case 'oneOf':
          this.writeOneOfSchema(result, schema);
          break;
        case 'not':
          this.writeNotSchema(result, schema);
          break;
        case 'array':
          this.writeArraySchema(result, schema);
          break;
        case 'object':
          this.writeObjectSchema(result, schema);
          break;
        case 'boolean':
          this.writeBooleanSchema(result, schema);
          break;
        // case 'integer':
        case 'number':
          this.writeNumericSchema(result, schema);
          break;
        case 'string':
          this.writeStringSchema(result, schema);
          break;
        default:
          throw new Error(`Unsupported schema type ${String(schema.type)}`);
      }
    }
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  private writeExtensionFields(extensionFields: ExtensionFields): JSONObject {
    return Object.fromEntries(extensionFields.entries());
  }

  // eslint-disable-next-line class-methods-use-this
  private writeSchemaCommon(json: JSONObject, schema: JSONSchema): void {
    if (schema.title) {
      json.title = schema.title;
    }
    if (schema.description) {
      json.description = schema.description;
    }
    if (schema.format) {
      json.format = schema.format;
    }
    if (schema.nullable) {
      json.nullable = true;
    }
    if (schema.default != null) {
      json.default = schema.default;
    }
    if (schema.example != null) {
      json.example = schema.example;
    }
  }

  private writeAllOfSchema(json: JSONObject, schema: JSONSchemaOrReference): void {
    const allOfSchema = schema as AllOfSchema;
    if (allOfSchema.alternatives.length) {
      json.allOf = allOfSchema.alternatives.map(item => this.writeSchema(item));
    }
  }

  private writeAnyOfSchema(json: JSONObject, schema: JSONSchemaOrReference): void {
    const anyOfSchema = schema as AnyOfSchema;
    if (anyOfSchema.alternatives.length) {
      json.anyOf = anyOfSchema.alternatives.map(item => this.writeSchema(item));
    }
  }

  private writeOneOfSchema(json: JSONObject, schema: JSONSchemaOrReference): void {
    const oneOfSchema = schema as OneOfSchema;
    if (oneOfSchema.alternatives.length) {
      json.oneOf = oneOfSchema.alternatives.map(item => this.writeSchema(item));
    }
  }

  private writeNotSchema(json: JSONObject, schema: JSONSchemaOrReference): void {
    const notSchema = schema as NotSchema;
    json.not = this.writeSchema(notSchema.baseSchema);
  }

  private writeArraySchema(json: JSONObject, schema: JSONSchemaOrReference): void {
    const arraySchema = schema as ArraySchema;
    json.type = arraySchema.type;
    json.items = this.writeSchema(arraySchema.itemSchema);
  }

  private writeObjectSchema(json: JSONObject, schema: JSONSchemaOrReference): void {
    const objectSchema = schema as ObjectSchema;
    json.type = objectSchema.type;
    if (objectSchema.required.length) {
      json.required = objectSchema.required;
    }
    if (objectSchema.properties.size) {
      json.properties = {};
      for (const [propName, propValue] of objectSchema.properties) {
        json.properties[propName] = this.writeSchema(propValue);
      }
    }
    if (typeof objectSchema.additionalProperties === 'object') {
      json.additionalProperties = this.writeSchema(objectSchema.additionalProperties);
    } else if (!objectSchema.additionalProperties) {
      json.additionalProperties = false;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private writeBooleanSchema(json: JSONObject, schema: JSONSchemaOrReference): void {
    const booleanSchema = schema as BooleanSchema;
    json.type = booleanSchema.type;
    if (booleanSchema.enum) {
      json.enum = booleanSchema.enum;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private writeNumericSchema(json: JSONObject, schema: JSONSchemaOrReference): void {
    const numericSchema = schema as NumberSchema;
    json.type = numericSchema.type;
    if (numericSchema.enum != null) {
      json.enum = numericSchema.enum;
    }
    if (numericSchema.format != null) {
      json.format = numericSchema.format;
    }
    if (numericSchema.maximum != null) {
      json.maximum = numericSchema.maximum;
    }
    if (numericSchema.exclusiveMaximum) {
      json.exclusiveMaximum = numericSchema.exclusiveMaximum;
    }
    if (numericSchema.minimum != null) {
      json.minimum = numericSchema.minimum;
    }
    if (numericSchema.exclusiveMinimum) {
      json.exclusiveMinimum = numericSchema.exclusiveMinimum;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private writeStringSchema(json: JSONObject, schema: JSONSchemaOrReference): void {
    const stringSchema = schema as StringSchema;
    json.type = stringSchema.type;
    if (stringSchema.enum) {
      json.enum = stringSchema.enum;
    }
    if (stringSchema.minLength != null) {
      json.minLength = stringSchema.minLength;
    }
    if (stringSchema.maxLength != null) {
      json.maxLength = stringSchema.maxLength;
    }
    if (stringSchema.pattern != null) {
      json.pattern = stringSchema.pattern;
    }
  }
}

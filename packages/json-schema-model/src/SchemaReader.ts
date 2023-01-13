import { AllOfSchema } from './AllOfSchema';
import { AnyOfSchema } from './AnyOfSchema';

import type { SchemaParent } from './SchemaBase';

import { ArraySchema } from './ArraySchema';

import type { JSONSchema, JSONSchemaOrReference, SchemaFormat } from './types';

import { BooleanSchema } from './BooleanSchema';

import type { JSONArray, JSONObject, JSONValue, Nullable } from '@fresha/api-tools-core';

import { NotSchema } from './NotSchema';
import { NumberSchema } from './NumberSchema';
import { ObjectSchema } from './ObjectSchema';
import { OneOfSchema } from './OneOfSchema';
import { Reference } from './Reference';
import { StringSchema } from './StringSchema';

type MutableExtensionFields = Map<string, JSONValue>;

const getStringAttribute = (json: JSONObject, name: string, required = true): Nullable<string> => {
  const result = json[name];
  if (typeof result === 'string') {
    return result;
  }
  if (!required && result == null) {
    return null;
  }
  throw new Error(
    `Property ${name} is expected to be a string, but it is ${typeof result} instead`,
  );
};

export class SchemaReader {
  parse(json: JSONObject, parent: SchemaParent): JSONSchemaOrReference {
    const ref = this.parseReference(json, parent);
    if (ref) {
      return ref;
    }

    if (json.allOf) {
      return this.parseAllOfSchema(json, parent);
    }
    if (json.anyOf) {
      return this.parseAnyOfSchema(json, parent);
    }
    if (json.oneOf) {
      return this.parseOneOfSchema(json, parent);
    }
    if (json.not) {
      return this.parseNotSchema(json, parent);
    }
    if (json.type === 'array') {
      return this.parseArraySchema(json, parent);
    }
    if (json.type === 'object') {
      return this.parseObjectSchema(json, parent);
    }
    if (json.type === 'boolean') {
      return this.parseBooleanSchema(json, parent);
    }
    if (json.type === 'number' || json.type === 'integer') {
      return this.parseNumberSchema(json, parent);
    }
    if (json.type === 'string') {
      return this.parseStringSchema(json, parent);
    }

    throw new Error(`Cannot parse schema ${JSON.stringify(json, null, 2)}`);
  }

  private parseReference(json: JSONObject, parent: SchemaParent): Reference | null {
    if (!json.$ref) {
      return null;
    }

    const result = new Reference(parent, json.$ref as string);
    this.parseExtensionFields(json, result.extensionFields);
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  private parseExtensionFields(
    json: JSONObject,
    extensionFields: MutableExtensionFields,
    reset = false,
  ): void {
    if (reset) {
      extensionFields.clear();
    }
    for (const [key, value] of Object.entries(json)) {
      if (key.startsWith('x-')) {
        extensionFields.set(key.slice(2), value);
      }
    }
  }

  private parseSchemaCommon(json: JSONObject, schema: JSONSchema): void {
    this.parseExtensionFields(json, schema.extensionFields as MutableExtensionFields);
    schema.title = getStringAttribute(json, 'title', false);
    schema.description = getStringAttribute(json, 'description', false);
    schema.format = getStringAttribute(json, 'format', false) as SchemaFormat;
    if (json.nullable) {
      schema.nullable = json.nullable as boolean;
    }
    if ('default' in json) {
      schema.default = json.default;
    }
    if ('example' in json) {
      schema.example = json.example;
    }
  }

  private parseAllOfSchema(json: JSONObject, parent: SchemaParent): AllOfSchema {
    if (!json.allOf) {
      throw new Error('Missing allOf attribute');
    }

    const result = new AllOfSchema(parent);
    this.parseSchemaCommon(json, result);
    for (const subschemaJson of json.allOf as JSONArray) {
      const subschema = this.parse(subschemaJson as JSONObject, result);
      result.alternatives.push(subschema);
    }
    return result;
  }

  private parseAnyOfSchema(json: JSONObject, parent: SchemaParent): AnyOfSchema {
    if (!json.anyOf) {
      throw new Error('Missing anyOf attribute');
    }

    const result = new AnyOfSchema(parent);
    this.parseSchemaCommon(json, result);
    for (const subschemaJson of json.anyOf as JSONObject[]) {
      const subschema = this.parse(subschemaJson, result);
      result.alternatives.push(subschema);
    }
    return result;
  }

  private parseOneOfSchema(json: JSONObject, parent: SchemaParent): OneOfSchema {
    if (!json.oneOf) {
      throw new Error('Missing oneOf attribute');
    }

    const result = new OneOfSchema(parent);
    this.parseSchemaCommon(json, result);
    for (const subschemaJson of json.anyOf as JSONObject[]) {
      const subschema = this.parse(subschemaJson, result);
      result.alternatives.push(subschema);
    }
    return result;
  }

  private parseNotSchema(json: JSONObject, parent: SchemaParent): NotSchema {
    if (!json.not) {
      throw new Error('Missing not attribute');
    }

    const result = new NotSchema(parent);
    this.parseSchemaCommon(json, result);
    result.baseSchema = this.parse(json.not as JSONObject, result);
    return result;
  }

  private parseArraySchema(json: JSONObject, parent: SchemaParent): ArraySchema {
    if (json.type !== 'array') {
      throw new Error('Expected array type');
    }

    const result = new ArraySchema(parent);
    this.parseSchemaCommon(json, result);
    result.itemSchema = this.parse(json.items as JSONObject, result);
    return result;
  }

  private parseObjectSchema(json: JSONObject, parent: SchemaParent): ObjectSchema {
    if (json.type !== 'object') {
      throw new Error('Expected object type');
    }

    const result = new ObjectSchema(parent);
    this.parseSchemaCommon(json, result);
    if (json.required) {
      result.required = json.required as string[];
    }
    if (json.properties) {
      for (const [name, propertyJson] of Object.entries(json.properties as JSONObject)) {
        const property = this.parse(propertyJson as JSONObject, result);
        result.properties.set(name, property);
      }
    }
    if (typeof json.additionalProperties === 'boolean') {
      result.additionalProperties = json.additionalProperties;
    } else if (json.additionalProperties) {
      result.additionalProperties = this.parse(json.additionalProperties as JSONObject, result);
    }
    return result;
  }

  private parseBooleanSchema(json: JSONObject, parent: SchemaParent): BooleanSchema {
    if (json.type !== 'boolean') {
      throw new Error('Expected boolean type');
    }

    const result = new BooleanSchema(parent);
    this.parseSchemaCommon(json, result);
    if (Array.isArray(json.enum) && json.enum.length) {
      result.allowed = json.enum.map(elem => !!elem);
    }
    return result;
  }

  private parseNumberSchema(json: JSONObject, parent: SchemaParent): NumberSchema {
    if (json.type !== 'number' && json.type !== 'integer') {
      throw new Error('Expected number or integer types');
    }

    const result = new NumberSchema(parent);
    this.parseSchemaCommon(json, result);
    if (Array.isArray(json.enum) && json.enum.length) {
      result.allowed = json.enum.map(elem => Number(elem));
    }
    if (json.format) {
      result.format = json.format as SchemaFormat;
    }
    if (json.maximum) {
      result.maximum = json.maximum as number;
    }
    if (json.exclusiveMaximum) {
      result.exclusiveMaximum = json.exclusiveMaximum as boolean;
    }
    if (json.minimum) {
      result.minimum = json.minimum as number;
    }
    if (json.exclusiveMinimum) {
      result.exclusiveMinimum = json.exclusiveMinimum as boolean;
    }
    if (json.multipleOf) {
      result.multipleOf = json.multipleOf as number;
    }
    return result;
  }

  private parseStringSchema(json: JSONObject, parent: SchemaParent): StringSchema {
    if (json.type !== 'string') {
      throw new Error('Expected string type');
    }

    const result = new StringSchema(parent);
    this.parseSchemaCommon(json, result);
    if (Array.isArray(json.enum) && json.enum.length) {
      result.allowed = json.enum.map(elem => String(elem));
    }
    if (json.maxLength) {
      result.maxLength = json.maxLength as number;
    }
    if (json.minLength) {
      result.minLength = json.minLength as number;
    }
    if (json.pattern) {
      result.pattern = json.pattern as string;
    }
    return result;
  }
}

import { OpenAPI } from './OpenAPI';
import { Schema, SchemaFactory } from './Schema';

describe('SchemaFactory', () => {
  test('create()', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const booleanSchema = SchemaFactory.create(openapi.components, 'boolean') as Schema;
    expect(booleanSchema.parent).toBe(openapi.components);
    expect(booleanSchema.type).toBe('boolean');

    const genericIntegerSchema = SchemaFactory.create(openapi.components, 'integer');
    expect(genericIntegerSchema.type).toBe('integer');
    expect(genericIntegerSchema.format).toBeNull();

    const int32Schema = SchemaFactory.create(openapi.components, 'int32');
    expect(int32Schema.type).toBe('integer');
    expect(int32Schema.format).toBe('int32');

    const dateTimeSchema = SchemaFactory.create(openapi.components, 'date-time');
    expect(dateTimeSchema.type).toBe('string');
    expect(dateTimeSchema.format).toBe('date-time');
  });

  test('createArray()', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const stringArraySchema = SchemaFactory.createArray(openapi.components, 'string') as Schema;
    expect(stringArraySchema.parent).toBe(openapi.components);
    expect(stringArraySchema.minItems).toBeNull();
    expect(stringArraySchema.maxItems).toBeNull();
    expect(stringArraySchema.items?.type).toBe('string');

    const numberArraySchema = SchemaFactory.createArray(openapi.components, {
      itemsOptions: 'number',
      minItems: 10,
      maxItems: 12,
    });
    expect(numberArraySchema.minItems).toBe(10);
    expect(numberArraySchema.maxItems).toBe(12);

    const itemSchema = SchemaFactory.create(openapi.components, 'integer') as Schema;
    const integerArraySchema = SchemaFactory.createArray(openapi.components, itemSchema);
    expect(itemSchema.parent).toBe(openapi.components);
    expect(integerArraySchema.items).toBe(itemSchema);
  });

  test('createObject()', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const emptyObjectSchema = SchemaFactory.createObject(openapi.components, {}) as Schema;
    expect(emptyObjectSchema.parent).toBe(openapi.components);
    expect(emptyObjectSchema.properties).toHaveProperty('size', 0);
    expect(emptyObjectSchema.required.size).toBe(0);

    const objectSchema = SchemaFactory.createObject(openapi.components, {
      name: 'string',
      age: { type: 'int32', required: true },
      active: { type: 'boolean', required: true },
    });
    expect(objectSchema.properties).toHaveProperty('size', 3);
    expect(objectSchema.properties.get('name')?.type).toBe('string');
    expect(objectSchema.properties.get('age')?.type).toBe('integer');
    expect(objectSchema.required).toStrictEqual(new Set<string>(['age', 'active']));
  });
});

describe('Schema', () => {
  test('setProperty', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const schema = SchemaFactory.create(openapi.components, 'object');
    expect(schema.properties.size).toBe(0);
    expect(schema.required.size).toBe(0);

    const optionalProp = schema.setProperty('x', 'int32') as Schema;
    expect(optionalProp.parent).toBe(schema);
    expect(optionalProp.type).toBe('integer');
    expect(optionalProp.format).toBe('int32');
    expect(schema.properties.get('x')).toBe(optionalProp);
    expect(schema.required.size).toBe(0);

    const requiredProp = schema.setProperty('y', { type: 'date', required: true }) as Schema;
    expect(requiredProp.parent).toBe(schema);
    expect(schema.required.has('y')).toBe(true);
  });

  test('setProperties', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const schema = SchemaFactory.create(openapi.components, 'object');
    schema.setProperties({
      x: 'string',
      y: 'int32',
      z: { type: 'boolean', required: true },
    });
    expect(schema.properties.size).toBe(3);
    expect(schema.required).toStrictEqual(new Set<string>(['z']));
  });

  test('deleteProperty', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const schema = SchemaFactory.create(openapi.components, 'object');
    schema.setProperties({
      x: 'string',
      y: 'int32',
      z: { type: 'date', required: true },
    });
    expect(schema.properties.size).toBe(3);
    expect(schema.required.size).toBe(1);

    schema.deleteProperty('z');

    expect(schema.properties.get('z')).toBeUndefined();
    expect(schema.required.size).toBe(0);
  });

  test('clearProperties()', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const schema = SchemaFactory.create(openapi.components, 'object');
    schema.setProperties({
      x: 'string',
      y: 'int32',
      z: { type: 'date', required: true },
    });
    schema.clearProperties();

    expect(schema.properties.size).toBe(0);
    expect(schema.required.size).toBe(0);
  });

  test('setPropertyRequired', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const schema = SchemaFactory.createObject(openapi.components, {
      a: 'string',
      b: 'binary',
      c: 'object',
    });
    schema.setPropertyRequired('a', true);
    schema.setPropertyRequired('c', true);

    expect(schema.required).toStrictEqual(new Set<string>(['a', 'c']));
  });

  test('addAllOf', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const schema = SchemaFactory.create(openapi.components, null);
    expect(schema.allOf).toBeNull();

    const option1 = schema.addAllOf('integer');

    const anotherSchema = SchemaFactory.create(openapi.components, null);
    const option2 = schema.addAllOf(anotherSchema);

    expect(option1).toHaveProperty('parent', schema);
    expect(option2).toBe(anotherSchema);

    expect(schema.allOf?.length).toBe(2);
    expect(schema.allOf?.[0]).toBe(option1);
    expect(schema.allOf?.[1]).toBe(option2);
  });

  test('deleteAllOfAt', () => {
    const openapi = new OpenAPI('example', '0.1.0');
    const schema = SchemaFactory.create(openapi.components, null);
    schema.addAllOf('integer');
    schema.addAllOf('double');

    schema.deleteAllOfAt(0);

    expect(schema.allOf).toHaveLength(1);
    expect(schema.allOf?.[0]).toHaveProperty('type', 'number');

    schema.deleteAllOfAt(0);

    expect(schema.allOf).toBeNull();
  });

  test('clearAllOf', () => {
    const openapi = new OpenAPI('example', '0.1.0');
    const schema = SchemaFactory.create(openapi.components, null);
    schema.addAllOf('integer');
    schema.addAllOf('double');

    expect(schema.allOf).toHaveLength(2);

    schema.clearAllOf();

    expect(schema.allOf).toBeNull();
  });

  test('addOneOf', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const schema = SchemaFactory.create(openapi.components, null);
    expect(schema.allOf).toBeNull();

    const option1 = schema.addOneOf('integer');

    const anotherSchema = SchemaFactory.create(openapi.components, null);
    const option2 = schema.addOneOf(anotherSchema);

    expect(option1).toHaveProperty('parent', schema);
    expect(option2).toBe(anotherSchema);

    expect(schema.oneOf?.length).toBe(2);
    expect(schema.oneOf?.[0]).toBe(option1);
    expect(schema.oneOf?.[1]).toBe(option2);
  });

  test('deleteOneOfAt', () => {
    const openapi = new OpenAPI('example', '0.1.0');
    const schema = SchemaFactory.create(openapi.components, null);
    schema.addOneOf('integer');
    schema.addOneOf('double');

    schema.deleteOneOfAt(0);

    expect(schema.oneOf).toHaveLength(1);
    expect(schema.oneOf?.[0]).toHaveProperty('type', 'number');

    schema.deleteOneOfAt(0);

    expect(schema.oneOf).toBeNull();
  });

  test('clearOneOf', () => {
    const openapi = new OpenAPI('example', '0.1.0');
    const schema = SchemaFactory.create(openapi.components, null);
    schema.addOneOf('integer');
    schema.addOneOf('double');

    expect(schema.oneOf).toHaveLength(2);

    schema.clearOneOf();

    expect(schema.oneOf).toBeNull();
  });

  test('arrayOf', () => {
    const openapi = new OpenAPI('example', '0.1.0');
    const itemSchema = SchemaFactory.create(openapi.components, 'integer');

    const arraySchema = itemSchema.arrayOf(openapi.components);

    expect(arraySchema.items).toBe(itemSchema);
  });
});

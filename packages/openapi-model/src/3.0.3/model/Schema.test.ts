import { OpenAPI } from './OpenAPI';
import { SchemaFactory } from './Schema';
import { SchemaModel } from './types';

let openapi: OpenAPI;

beforeEach(() => {
  openapi = new OpenAPI('example', '0.1.0');
});

describe('SchemaFactory', () => {
  test('create() w/ string type', () => {
    const nullTypeSchema = SchemaFactory.create(openapi.components, null);
    expect(nullTypeSchema.parent).toBe(openapi.components);
    expect(nullTypeSchema.type).toBe(null);

    const booleanSchema = SchemaFactory.create(openapi.components, 'boolean');
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

    const emailSchema = SchemaFactory.create(openapi.components, 'email');
    expect(emailSchema).toHaveProperty('type', 'string');
    expect(emailSchema).toHaveProperty('format', 'email');

    const decimalSchema = SchemaFactory.create(openapi.components, 'decimal');
    expect(decimalSchema).toHaveProperty('type', 'string');
    expect(decimalSchema).toHaveProperty('format', 'decimal');
  });

  test('create() w/ object options', () => {
    const booleanSchema = SchemaFactory.create(openapi.components, {
      type: 'boolean',
      nullable: true,
      enum: [false],
    });
    expect(booleanSchema).toHaveProperty('parent', openapi.components);
    expect(booleanSchema).toHaveProperty('type', 'boolean');
    expect(booleanSchema).toHaveProperty('nullable', true);
    expect(Array.from(booleanSchema.allowedValues())).toEqual([false]);

    const int32Schema = SchemaFactory.create(openapi.components, {
      type: 'int32',
      minimum: 12,
      maximum: 34,
    });
    expect(int32Schema).toHaveProperty('type', 'integer');
    expect(int32Schema).toHaveProperty('format', 'int32');
    expect(int32Schema).toHaveProperty('minimum', 12);
    expect(int32Schema).toHaveProperty('maximum', 34);

    const stringSchema = SchemaFactory.create(openapi.components, {
      type: 'string',
      minLength: 1,
      maxLength: 12,
    });
    expect(stringSchema).toHaveProperty('type', 'string');
    expect(stringSchema).toHaveProperty('format', null);
    expect(stringSchema).toHaveProperty('minLength', 1);
    expect(stringSchema).toHaveProperty('maxLength', 12);
  });

  test('create() w/ deep hierarchy', () => {
    const employee = openapi.components.setSchema('Employee', {
      type: 'object',
      properties: {
        attributes: {
          type: 'object',
          properties: {
            name: { type: 'string', required: true },
            age: { type: 'int32', nullable: true },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
          },
        },
        relationships: {
          type: 'object',
          properties: {
            mentor: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    type: 'string',
                    id: 'string',
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(employee).toHaveProperty('type', 'object');

    const attributes = employee.getPropertyOrThrow('attributes');
    expect(attributes).toHaveProperty('parent', employee);
    expect(attributes).toHaveProperty('type', 'object');

    const name = attributes.getPropertyOrThrow('name');
    expect(name).toHaveProperty('parent', attributes);
    expect(name).toHaveProperty('type', 'string');
    expect(attributes.isPropertyRequired('name')).toBeTruthy();

    const age = attributes.getPropertyOrThrow('age');
    expect(age).toHaveProperty('parent', attributes);
    expect(age).toHaveProperty('type', 'integer');
    expect(age).toHaveProperty('nullable', true);
    expect(attributes.isPropertyRequired('age')).toBeFalsy();

    const gender = attributes.getPropertyOrThrow('gender');
    expect(gender).toHaveProperty('type', 'string');
    expect(Array.from(gender.allowedValues())).toEqual(['male', 'female', 'other']);

    const mentorId = employee
      .getPropertyOrThrow('relationships')
      .getPropertyOrThrow('mentor')
      .getPropertyOrThrow('data');
    expect(mentorId).toHaveProperty('type', 'object');

    expect(mentorId.getPropertyOrThrow('type')).toHaveProperty('type', 'string');
    expect(mentorId.getPropertyOrThrow('id')).toHaveProperty('type', 'string');
  });

  test('createArray()', () => {
    const stringArraySchema = SchemaFactory.createArray(openapi.components, 'string');
    expect(stringArraySchema.parent).toBe(openapi.components);
    expect(stringArraySchema.minItems).toBeNull();
    expect(stringArraySchema.maxItems).toBeNull();
    expect(!Array.isArray(stringArraySchema.items) && stringArraySchema.items?.type).toBe('string');

    const numberArraySchema = SchemaFactory.createArray(openapi.components, {
      itemsOptions: 'number',
      minItems: 10,
      maxItems: 12,
    });
    expect(numberArraySchema.minItems).toBe(10);
    expect(numberArraySchema.maxItems).toBe(12);

    const itemSchema = SchemaFactory.create(openapi.components, 'integer');
    const integerArraySchema = SchemaFactory.createArray(openapi.components, itemSchema);
    expect(itemSchema.parent).toBe(openapi.components);
    expect(integerArraySchema.items).toBe(itemSchema);
  });

  test('createObject()', () => {
    const emptyObjectSchema = SchemaFactory.createObject(openapi.components, {});
    expect(emptyObjectSchema.parent).toBe(openapi.components);
    expect(emptyObjectSchema.propertyCount).toBe(0);
    expect(emptyObjectSchema.requiredPropertyCount).toBe(0);

    const objectSchema = SchemaFactory.createObject(openapi.components, {
      name: 'string',
      age: { type: 'int32', required: true },
      active: { type: 'boolean', required: true },
    });
    expect(objectSchema.propertyCount).toBe(3);
    expect(objectSchema.getProperty('name')?.type).toBe('string');
    expect(objectSchema.getProperty('age')?.type).toBe('integer');
    expect(Array.from(objectSchema.requiredPropertyNames())).toStrictEqual(['age', 'active']);
  });

  test('createOrGet()', () => {
    const schema1 = openapi.components.setSchema('Schema1', 'object');
    expect(SchemaFactory.createOrGet(openapi.components, schema1)).toBe(schema1);

    const schema2 = SchemaFactory.createOrGet(openapi.components, 'string');
    expect(schema2).toHaveProperty('parent', openapi.components);
    expect(schema2).toHaveProperty('type', 'string');
  });
});

describe('Schema', () => {
  test('allowedValues', () => {
    const schema = openapi.components.setSchema('EnumSchema', null);
    schema.addAllowedValues(1, '124', true, { a: 123 }, [12, null]);

    expect(Array.from(schema.allowedValues())).toEqual([1, '124', true, { a: 123 }, [12, null]]);
    expect(schema.hasAllowedValue({ a: 123 })).toBeTruthy();
    expect(schema.allowedValueCount).toBe(5);

    schema.deleteAllowedValueAt(2);
    expect(Array.from(schema.allowedValues())).toEqual([1, '124', { a: 123 }, [12, null]]);
    expect(schema.hasAllowedValue('124')).toBeTruthy();
    expect(schema.hasAllowedValue([12, null])).toBeTruthy();
    expect(schema.allowedValueCount).toBe(4);

    schema.deleteAllowedValues(1, { a: 123 });
    expect(Array.from(schema.allowedValues())).toEqual(['124', [12, null]]);
    expect(schema.hasAllowedValue({ a: 123 })).toBeFalsy();
    expect(schema.allowedValueCount).toBe(2);

    schema.addAllowedValues([12, null], { a: 123 });
    expect(Array.from(schema.allowedValues())).toEqual(['124', [12, null], { a: 123 }]);
    expect(schema.hasAllowedValue({ a: 123 })).toBeTruthy();
    expect(schema.allowedValueCount).toBe(3);

    schema.clearAllowedValues();
    expect(schema.allowedValueCount).toBe(0);
  });

  test('isComposite', () => {
    const objectSchema = openapi.components.setSchema('ObjectSchema', 'object');
    objectSchema.setProperties({
      one: 'string',
      two: 'boolean',
    });

    expect(objectSchema.isComposite()).toBeFalsy();

    const arraySchema = openapi.components.setSchema('ArraySchema', 'array');
    arraySchema.setItems('object');

    expect(arraySchema.isComposite()).toBeFalsy();

    const schemaWithAllOf = openapi.components.setSchema('WithAllOf', null);
    schemaWithAllOf.addAllOf('boolean');
    schemaWithAllOf.addAllOf('object');

    expect(schemaWithAllOf.isComposite()).toBeTruthy();

    const schemaWithOneOf = openapi.components.setSchema('WithOneOf', null);
    schemaWithOneOf.addOneOf('boolean');
    schemaWithOneOf.addOneOf('date-time');

    expect(schemaWithAllOf.isComposite()).toBeTruthy();

    const schemaWithAnyOf = openapi.components.setSchema('WithAnyOf', null);
    schemaWithAnyOf.addAnyOf('boolean');

    expect(schemaWithAnyOf.isComposite()).toBeTruthy();
  });

  test('isNull', () => {
    const nullTypedButNoEnum = openapi.components.setSchema('OnlyNullType');
    expect(nullTypedButNoEnum.isNull()).toBeFalsy();

    const typedWithEnum = openapi.components.setSchema('OnlyNullEnum', 'boolean');
    typedWithEnum.addAllowedValues(null);
    expect(typedWithEnum.isNull()).toBeFalsy();

    const nullSchema = openapi.components.setSchema('Null');
    nullSchema.addAllowedValues(null);
    expect(nullSchema.isNull()).toBeTruthy();
  });

  describe('isNullish', () => {
    test('true for nullable schemas', () => {
      const nullableSchema = openapi.components.setSchema('NullableNumber', 'number');
      nullableSchema.nullable = true;
      expect(nullableSchema.isNullish()).toBeTruthy();

      const nonNullableSchema = openapi.components.setSchema('Number', 'number');
      expect(nonNullableSchema.isNullish()).toBeFalsy();
    });

    test('true for null schemas', () => {
      const nullSchema = openapi.components.setSchema('Null');
      nullSchema.addAllowedValues(null);

      expect(nullSchema.isNullish()).toBeTruthy();
    });

    test('true if at least one subschema is nullish', () => {
      const nullishSchema = openapi.components.setSchema('NullishSchema');

      nullishSchema.addOneOf('object');

      const alt2 = nullishSchema.addOneOf(null);
      alt2.addAnyOf('array');

      const alt4 = alt2.addAnyOf(null);
      alt4.addAllOf('string');
      alt4.addAllOf(null).addAllowedValues(null);

      expect(nullishSchema.isNullish()).toBeTruthy();
    });

    test('false if no subschema is nullish', () => {
      const nullishSchema = openapi.components.setSchema('NullishSchema');
      const alt1 = SchemaFactory.create(nullishSchema, 'object');
      const alt2 = SchemaFactory.create(nullishSchema, null);
      nullishSchema.addOneOf(alt1);
      nullishSchema.addOneOf(alt2);

      alt2.addAnyOf('array');
      const alt4 = alt2.addAnyOf(null);

      alt4.addAllOf('string');
      alt4.addAllOf('boolean');

      expect(nullishSchema.isNullish()).toBeFalsy();
    });
  });

  test('getProperty + getPropertyOrThrow', () => {
    const schema = SchemaFactory.create(openapi.components, 'object');
    schema.setProperties({ a: 'string', b: 'date' });

    expect(schema.getProperty('a')).not.toBeUndefined();
    expect(schema.getProperty('')).toBeUndefined();
    expect(schema.getPropertyOrThrow('b')).not.toBeUndefined();
    expect(() => schema.getPropertyOrThrow('_')).toThrow();
  });

  test('getPropertyDeep + getPropertyDeepOrThrow', () => {
    const schema = openapi.components.setSchema('TestSchema', 'object');

    const ownString = schema.setProperty('own', 'string');

    const allOf1 = schema.addAllOf('object');
    allOf1.setProperty('own', 'string'); // same name as own property

    const allOf2 = schema.addAllOf('object');
    const idString = allOf2.setProperty('id', 'string');

    expect(schema.getPropertyDeep('own')).toBe(ownString);
    expect(schema.getPropertyDeep('id')).toBe(idString);

    expect(() => schema.getPropertyDeepOrThrow('none')).toThrow();
  });

  describe('setProperty', () => {
    let schema: SchemaModel;

    beforeEach(() => {
      schema = SchemaFactory.create(openapi.components, 'object');
    });

    test('empty state', () => {
      expect(schema.propertyCount).toBe(0);
      expect(schema.requiredPropertyCount).toBe(0);
    });

    test('common attributes', () => {
      schema.setProperty('prop1', { type: 'boolean', required: true });
      expect(schema.isPropertyRequired('prop1')).toBeTruthy();

      const prop2 = schema.setProperty('prop2', { type: 'decimal', nullable: true });
      expect(prop2).toHaveProperty('nullable', true);

      const prop3 = schema.setProperty('prop3', { type: 'string', readOnly: true });
      expect(prop3).toHaveProperty('readOnly', true);

      const prop4 = schema.setProperty('prop4', { type: 'email', writeOnly: true });
      expect(prop4).toHaveProperty('writeOnly', true);
    });

    describe('boolean type', () => {
      test('defaults', () => {
        const prop1 = schema.setProperty('prop1', 'boolean');
        expect(prop1).toHaveProperty('parent', schema);
        expect(prop1).toHaveProperty('allowedValueCount', 0);
        expect(prop1).toHaveProperty('default', null);

        const prop2 = schema.setProperty('prop2', { type: 'boolean' });
        expect(prop2).toHaveProperty('parent', schema);
        expect(prop2).toHaveProperty('allowedValueCount', 0);
        expect(prop2).toHaveProperty('default', null);

        expect(schema.isPropertyRequired('prop1')).toBeFalsy();
        expect(schema.isPropertyRequired('prop2')).toBeFalsy();
      });

      test('allowedValues', () => {
        const propEnum = [true];
        const prop1 = schema.setProperty('prop', {
          type: 'boolean',
          required: true,
          enum: propEnum,
        });
        expect(Array.from(prop1.allowedValues())).toEqual([true]);

        propEnum.push(false, true);
        expect(Array.from(prop1.allowedValues())).toEqual([true]);

        const prop2 = schema.setProperty('prop', {
          type: 'boolean',
          required: true,
          enum: [true, false, true],
        });
        expect(prop2).toHaveProperty('allowedValueCount', 0);
      });

      test('default', () => {
        const prop = schema.setProperty('defaultIsInEnum', {
          type: 'boolean',
          enum: [true],
          default: true,
        });
        expect(Array.from(prop.allowedValues())).toEqual([true]);
        expect(prop).toHaveProperty('default', true);

        expect(() =>
          schema.setProperty('defaultIsNotInEnum', {
            type: 'boolean',
            enum: [false],
            default: true,
          }),
        ).toThrow();
      });
    });

    describe('numeric types', () => {
      test('defaults', () => {
        const int32Prop = schema.setProperty('int32Prop', 'int32');
        expect(int32Prop).toHaveProperty('type', 'integer');
        expect(int32Prop).toHaveProperty('format', 'int32');
        expect(int32Prop).toHaveProperty('allowedValueCount', 0);
        expect(int32Prop).toHaveProperty('default', null);

        const int64Prop = schema.setProperty('int64Prop', 'int64');
        expect(int64Prop).toHaveProperty('type', 'integer');
        expect(int64Prop).toHaveProperty('format', 'int64');
        expect(int64Prop).toHaveProperty('allowedValueCount', 0);
        expect(int64Prop).toHaveProperty('default', null);

        const intProp = schema.setProperty('intProp', 'integer');
        expect(intProp).toHaveProperty('type', 'integer');
        expect(intProp).toHaveProperty('format', null);
        expect(intProp).toHaveProperty('allowedValueCount', 0);
        expect(intProp).toHaveProperty('default', null);

        const numberProp = schema.setProperty('numberProp', 'number');
        expect(numberProp).toHaveProperty('type', 'number');
        expect(numberProp).toHaveProperty('format', null);
        expect(numberProp).toHaveProperty('allowedValueCount', 0);
        expect(numberProp).toHaveProperty('default', null);

        expect(schema.isPropertyRequired('int32Prop')).toBeFalsy();
        expect(schema.isPropertyRequired('int64Prop')).toBeFalsy();
        expect(schema.isPropertyRequired('intProp')).toBeFalsy();
        expect(schema.isPropertyRequired('numberProp')).toBeFalsy();
      });

      test('allowedValues', () => {
        const enumValues = [1, 3, 12];
        const enumProp = schema.setProperty('enumProp', { type: 'integer', enum: enumValues });
        expect(Array.from(enumProp.allowedValues())).toEqual([1, 3, 12]);

        enumValues.push(-9, 4);
        expect(Array.from(enumProp.allowedValues())).toEqual([1, 3, 12]);
      });

      test('default value', () => {
        const prop = schema.setProperty('prop', { type: 'number', default: 12 });
        expect(prop.default).toBe(12);

        expect(() =>
          schema.setProperty('prop2', { type: 'int32', enum: [1, 3], default: 4 }),
        ).toThrow();
      });

      test('limits', () => {
        const prop0 = schema.setProperty('prop0', { type: 'integer' });
        expect(prop0).toHaveProperty('minimum', null);
        expect(prop0).toHaveProperty('maximum', null);
        expect(prop0).toHaveProperty('exclusiveMinimum', false);
        expect(prop0).toHaveProperty('exclusiveMaximum', false);

        const prop1 = schema.setProperty('prop1', { type: 'integer', minimum: 12 });
        expect(prop1).toHaveProperty('minimum', 12);

        const prop2 = schema.setProperty('prop2', { type: 'integer', maximum: 25 });
        expect(prop2).toHaveProperty('maximum', 25);

        const prop3 = schema.setProperty('prop3', { type: 'integer', minimum: 12, maximum: 30 });
        expect(prop3).toHaveProperty('minimum', 12);
        expect(prop3).toHaveProperty('maximum', 30);

        const prop4 = schema.setProperty('prop4', { type: 'integer', exclusiveMinimum: true });
        expect(prop4).toHaveProperty('exclusiveMinimum', true);

        const prop5 = schema.setProperty('prop5', { type: 'integer', exclusiveMaximum: false });
        expect(prop5).toHaveProperty('exclusiveMaximum', false);

        const prop6 = schema.setProperty('prop6', {
          type: 'integer',
          exclusiveMinimum: true,
          exclusiveMaximum: false,
        });
        expect(prop6).toHaveProperty('exclusiveMinimum', true);
        expect(prop6).toHaveProperty('exclusiveMaximum', false);
      });
    });

    describe('date types', () => {
      test('defaults', () => {
        const dateProp = schema.setProperty('dateProp', 'date');
        expect(dateProp).toHaveProperty('type', 'string');
        expect(dateProp).toHaveProperty('format', 'date');
        expect(dateProp).toHaveProperty('allowedValueCount', 0);
        expect(dateProp).toHaveProperty('default', null);

        const dateTimeProp = schema.setProperty('dateTimeProp', 'date-time');
        expect(dateTimeProp).toHaveProperty('type', 'string');
        expect(dateTimeProp).toHaveProperty('format', 'date-time');
        expect(dateTimeProp).toHaveProperty('allowedValueCount', 0);
        expect(dateTimeProp).toHaveProperty('default', null);
      });

      test('allowedValues', () => {
        const enumValues = ['2022-12-12'];
        const enumProp = schema.setProperty('enumProp', { type: 'date', enum: enumValues });
        expect(Array.from(enumProp.allowedValues())).toEqual(['2022-12-12']);

        enumValues.push('2022-01-01');
        expect(Array.from(enumProp.allowedValues())).toEqual(['2022-12-12']);
      });

      test('default value', () => {
        const prop = schema.setProperty('prop', { type: 'date', default: '2022-12-12' });
        expect(prop.default).toBe('2022-12-12');

        expect(() =>
          schema.setProperty('prop2', {
            type: 'date',
            enum: ['2022-02-03'],
            default: '2022-12-12',
          }),
        ).toThrow();
      });
    });

    describe('email', () => {
      test('defaults', () => {
        const prop = schema.setProperty('emailProp', 'email');
        expect(prop).toHaveProperty('type', 'string');
        expect(prop).toHaveProperty('format', 'email');
        expect(prop).toHaveProperty('allowedValueCount', 0);
        expect(prop).toHaveProperty('default', null);
      });

      test('allowedValues', () => {
        const enumValues = ['john@example.com'];
        const prop = schema.setProperty('emailSubset', { type: 'email', enum: enumValues });
        expect(Array.from(prop.allowedValues())).toEqual(['john@example.com']);

        enumValues.push('mary@example.com');
        expect(Array.from(prop.allowedValues())).toEqual(['john@example.com']);
      });

      test('default value', () => {
        const prop = schema.setProperty('prop', { type: 'email', default: 'john@example.com' });
        expect(prop.default).toBe('john@example.com');

        expect(() =>
          schema.setProperty('prop2', {
            type: 'date',
            enum: ['mary@example.com'],
            default: 'john@example.com',
          }),
        ).toThrow();
      });
    });

    describe('decimal', () => {
      test('defaults', () => {
        const prop = schema.setProperty('tipAmount', 'decimal');
        expect(prop).toHaveProperty('type', 'string');
        expect(prop).toHaveProperty('format', 'decimal');
        expect(prop).toHaveProperty('allowedValueCount', 0);
        expect(prop).toHaveProperty('default', null);
      });

      test('allowedValues', () => {
        const enumValues = ['12.34', '-0.000001'];
        const prop = schema.setProperty('decimalWithChoice', { type: 'decimal', enum: enumValues });
        expect(Array.from(prop.allowedValues())).toEqual(['12.34', '-0.000001']);

        enumValues.push('1.1111');
        expect(Array.from(prop.allowedValues())).toEqual(['12.34', '-0.000001']);
      });

      test('default value', () => {
        const prop = schema.setProperty('prop', { type: 'decimal', default: '0.00' });
        expect(prop.default).toBe('0.00');

        expect(() =>
          schema.setProperty('prop2', {
            type: 'decimal',
            enum: ['0.01'],
            default: '1.00',
          }),
        ).toThrow();
      });
    });

    describe('string property', () => {
      test('allowedValues', () => {
        const genderEnum = ['male', 'female'];
        const genderProp = schema.setProperty('gender', { type: 'string', enum: genderEnum });
        expect(Array.from(genderProp.allowedValues())).toEqual(['male', 'female']);

        genderEnum.push('non-binary');
        expect(Array.from(genderProp.allowedValues())).toEqual(['male', 'female']);
      });

      test('default', () => {
        const prop1 = schema.setProperty('prop1', { type: 'string', default: 'xyz' });
        expect(prop1).toHaveProperty('default', 'xyz');

        expect(() =>
          schema.setProperty('prop1', { type: 'string', enum: ['a'], default: 'xyz' }),
        ).toThrow();
      });

      test('pattern', () => {
        const prop = schema.setProperty('prop', { type: 'string', pattern: '[a-z]+' });
        expect(prop).toHaveProperty('pattern', '[a-z]+');
      });

      test('length', () => {
        const prop0 = schema.setProperty('prop0', { type: 'string' });
        expect(prop0).toHaveProperty('minLength', null);
        expect(prop0).toHaveProperty('maxLength', null);

        const prop1 = schema.setProperty('prop1', { type: 'string', minLength: 12 });
        expect(prop1).toHaveProperty('minLength', 12);

        const prop2 = schema.setProperty('prop2', { type: 'string', maxLength: 43 });
        expect(prop2).toHaveProperty('maxLength', 43);

        const prop3 = schema.setProperty('prop0', { type: 'string', minLength: 1, maxLength: 3 });
        expect(prop3).toHaveProperty('minLength', 1);
        expect(prop3).toHaveProperty('maxLength', 3);
      });
    });
  });

  test('setProperties', () => {
    const schema = SchemaFactory.create(openapi.components, 'object');
    schema.setProperties({
      x: 'string',
      y: 'int32',
      z: { type: 'boolean', required: true },
    });
    expect(schema.propertyCount).toBe(3);
    expect(Array.from(schema.requiredPropertyNames())).toStrictEqual(['z']);
  });

  test('deleteProperty', () => {
    const schema = SchemaFactory.create(openapi.components, 'object');
    schema.setProperties({
      x: 'string',
      y: 'int32',
      z: { type: 'date', required: true },
    });
    expect(schema.propertyCount).toBe(3);
    expect(schema.requiredPropertyCount).toBe(1);

    schema.deleteProperty('z');

    expect(schema.getProperty('z')).toBeUndefined();
    expect(schema.requiredPropertyCount).toBe(0);
  });

  test('clearProperties()', () => {
    const schema = SchemaFactory.create(openapi.components, 'object');
    schema.setProperties({
      x: 'string',
      y: 'int32',
      z: { type: 'date', required: true },
    });
    schema.clearProperties();

    expect(schema.propertyCount).toBe(0);
    expect(schema.requiredPropertyCount).toBe(0);
  });

  test('setPropertyRequired', () => {
    const schema = SchemaFactory.createObject(openapi.components, {
      a: 'string',
      b: 'binary',
      c: 'object',
    });
    schema.setPropertyRequired('a', true);
    schema.setPropertyRequired('c', true);

    expect(Array.from(schema.requiredPropertyNames())).toStrictEqual(['a', 'c']);
  });

  test('setItems', () => {
    const schema = SchemaFactory.create(openapi.components, 'array');
    expect(schema.items).toBeNull();

    const itemsSchema = schema.setItems('double');
    expect(itemsSchema).toBe(schema.items);
    expect(itemsSchema.type).toBe('number');
    expect(itemsSchema.format).toBe('double');
  });

  test('addAllOf', () => {
    const schema = SchemaFactory.create(openapi.components, null);
    expect(schema.allOfCount).toBe(0);

    const option1 = schema.addAllOf('integer');

    const anotherSchema = SchemaFactory.create(openapi.components, null);
    const option2 = schema.addAllOf(anotherSchema);

    expect(option1).toHaveProperty('parent', schema);
    expect(option2).toBe(anotherSchema);

    expect(schema.allOfCount).toBe(2);
    expect(schema.allOfAt(0)).toBe(option1);
    expect(schema.allOfAt(1)).toBe(option2);
  });

  test('deleteAllOfAt', () => {
    const schema = SchemaFactory.create(openapi.components, null);
    schema.addAllOf('integer');
    schema.addAllOf('double');

    schema.deleteAllOfAt(0);

    expect(schema.allOfCount).toBe(1);
    expect(schema.allOfAt(0)).toHaveProperty('type', 'number');

    schema.deleteAllOfAt(0);

    expect(schema.allOfCount).toBe(0);
  });

  test('clearAllOf', () => {
    const schema = SchemaFactory.create(openapi.components, null);
    schema.addAllOf('integer');
    schema.addAllOf('double');

    expect(schema.allOfCount).toBe(2);

    schema.clearAllOf();

    expect(schema.allOfCount).toBe(0);
  });

  test('addOneOf', () => {
    const schema = SchemaFactory.create(openapi.components, null);
    expect(schema.allOfCount).toBe(0);

    const option1 = schema.addOneOf('integer');

    const anotherSchema = SchemaFactory.create(openapi.components, null);
    const option2 = schema.addOneOf(anotherSchema);

    expect(option1).toHaveProperty('parent', schema);
    expect(option2).toBe(anotherSchema);

    expect(schema.oneOfCount).toBe(2);
    expect(schema.oneOfAt(0)).toBe(option1);
    expect(schema.oneOfAt(1)).toBe(option2);
  });

  test('deleteOneOfAt', () => {
    const schema = SchemaFactory.create(openapi.components, null);
    schema.addOneOf('integer');
    schema.addOneOf('double');

    schema.deleteOneOfAt(0);

    expect(schema.oneOfCount).toBe(1);
    expect(schema.oneOfAt(0)).toHaveProperty('type', 'number');

    schema.deleteOneOfAt(0);

    expect(schema.oneOfCount).toBe(0);
  });

  test('clearOneOf', () => {
    const schema = SchemaFactory.create(openapi.components, null);
    schema.addOneOf('integer');
    schema.addOneOf('double');

    expect(schema.oneOfCount).toBe(2);

    schema.clearOneOf();

    expect(schema.oneOfCount).toBe(0);
  });

  test('arrayOf', () => {
    const itemSchema = SchemaFactory.create(openapi.components, 'integer');

    const arraySchema = itemSchema.arrayOf(openapi.components);

    expect(arraySchema.items).toBe(itemSchema);
  });

  test('externalDocs', () => {
    const schema = openapi.components.setSchema('TestExternalDocs');
    expect(schema.externalDocs).toBeNull();

    expect(() => schema.setExternalDocs('not-a-url')).toThrow();
    expect(schema.externalDocs).toBeNull();

    const docs = schema.setExternalDocs('http://www.example.com');
    expect(schema.externalDocs).toBe(docs);

    expect(() => schema.setExternalDocs('http://another.example.com')).toThrow();

    schema.deleteExternalDocs();
    expect(schema.externalDocs).toBeNull();
  });

  describe('discriminator', () => {
    test('throws on attempt to discriminate on unknown property', () => {
      const shape = openapi.components.setSchema('Shape', {
        type: 'object',
        properties: { kind: { type: 'string', enum: ['square', 'circle'] } },
      });
      expect(() => shape.setDiscriminator('i do not exist')).toThrow();
    });
  });
});

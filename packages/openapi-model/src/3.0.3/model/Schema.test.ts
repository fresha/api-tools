import { OpenAPI } from './OpenAPI';
import { SchemaFactory } from './Schema';
import { SchemaModel } from './types';

describe('SchemaFactory', () => {
  test('create()', () => {
    const openapi = new OpenAPI('example', '0.1.0');

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
  });

  test('createArray()', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const stringArraySchema = SchemaFactory.createArray(openapi.components, 'string');
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

    const itemSchema = SchemaFactory.create(openapi.components, 'integer');
    const integerArraySchema = SchemaFactory.createArray(openapi.components, itemSchema);
    expect(itemSchema.parent).toBe(openapi.components);
    expect(integerArraySchema.items).toBe(itemSchema);
  });

  test('createObject()', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const emptyObjectSchema = SchemaFactory.createObject(openapi.components, {});
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
  test('getProperty + getPropertyOrThrow', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const schema = SchemaFactory.create(openapi.components, 'object');
    schema.setProperties({ a: 'string', b: 'date' });

    expect(schema.getProperty('a')).not.toBeUndefined();
    expect(schema.getProperty('')).toBeUndefined();
    expect(schema.getPropertyOrThrow('b')).not.toBeUndefined();
    expect(() => schema.getPropertyOrThrow('_')).toThrow();
  });

  describe('setProperty', () => {
    const makeSchema = (): SchemaModel => {
      const openapi = new OpenAPI('example', '0.1.0');
      return SchemaFactory.create(openapi.components, 'object');
    };

    let schema = makeSchema();

    beforeEach(() => {
      schema = makeSchema();
    });

    test('empty state', () => {
      expect(schema.properties.size).toBe(0);
      expect(schema.required.size).toBe(0);
    });

    test.only('common attributes', () => {
      schema.setProperty('prop1', { type: 'boolean', required: true });
      expect(schema.isPropertyRequired('prop1')).toBeTruthy();

      const prop2 = schema.setProperty('prop2', { type: 'integer', nullable: true });
      global.console.log(prop2);
      expect(prop2).toHaveProperty('nullable', true);

      const prop3 = schema.setProperty('prop3', { type: 'string', readOnly: true });
      expect(prop3).toHaveProperty('readOnly', true);

      const prop4 = schema.setProperty('prop4', { type: 'number', writeOnly: true });
      expect(prop4).toHaveProperty('writeOnly', true);
    });

    describe('boolean type', () => {
      test('defaults', () => {
        const prop1 = schema.setProperty('prop1', 'boolean');
        expect(prop1).toHaveProperty('parent', schema);
        expect(prop1).toHaveProperty('enum', null);
        expect(prop1).toHaveProperty('default', null);

        const prop2 = schema.setProperty('prop2', { type: 'boolean' });
        expect(prop2).toHaveProperty('parent', schema);
        expect(prop2).toHaveProperty('enum', null);
        expect(prop2).toHaveProperty('default', null);

        expect(schema.isPropertyRequired('prop1')).toBeFalsy();
        expect(schema.isPropertyRequired('prop2')).toBeFalsy();
      });

      test('enum', () => {
        const propEnum = [true];
        const prop1 = schema.setProperty('prop', {
          type: 'boolean',
          required: true,
          enum: propEnum,
        });
        expect(prop1).toHaveProperty('enum', [true]);

        propEnum.push(false, true);
        expect(prop1).toHaveProperty('enum', [true]);

        const prop2 = schema.setProperty('prop', {
          type: 'boolean',
          required: true,
          enum: [true, false, true],
        });
        expect(prop2).toHaveProperty('enum', null);
      });

      test('default', () => {
        const prop = schema.setProperty('defaultIsInEnum', {
          type: 'boolean',
          enum: [true],
          default: true,
        });
        expect(prop).toHaveProperty('enum', [true]);
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
        expect(int32Prop).toHaveProperty('enum', null);
        expect(int32Prop).toHaveProperty('default', null);

        const int64Prop = schema.setProperty('int64Prop', 'int64');
        expect(int64Prop).toHaveProperty('type', 'integer');
        expect(int64Prop).toHaveProperty('format', 'int64');
        expect(int64Prop).toHaveProperty('enum', null);
        expect(int64Prop).toHaveProperty('default', null);

        const intProp = schema.setProperty('intProp', 'integer');
        expect(intProp).toHaveProperty('type', 'integer');
        expect(intProp).toHaveProperty('format', null);
        expect(intProp).toHaveProperty('enum', null);
        expect(intProp).toHaveProperty('default', null);

        const numberProp = schema.setProperty('numberProp', 'number');
        expect(numberProp).toHaveProperty('type', 'number');
        expect(numberProp).toHaveProperty('format', null);
        expect(numberProp).toHaveProperty('enum', null);
        expect(numberProp).toHaveProperty('default', null);

        expect(schema.isPropertyRequired('int32Prop')).toBeFalsy();
        expect(schema.isPropertyRequired('int64Prop')).toBeFalsy();
        expect(schema.isPropertyRequired('intProp')).toBeFalsy();
        expect(schema.isPropertyRequired('numberProp')).toBeFalsy();
      });

      test('enum', () => {
        const enumValues = [1, 3, 12];
        const enumProp = schema.setProperty('enumProp', { type: 'integer', enum: enumValues });
        expect(enumProp).toHaveProperty('enum', [1, 3, 12]);

        enumValues.push(-9, 4);
        expect(enumProp).toHaveProperty('enum', [1, 3, 12]);
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
        expect(prop0).toHaveProperty('exclusiveMinimum', null);
        expect(prop0).toHaveProperty('exclusiveMaximum', null);

        const prop1 = schema.setProperty('prop1', { type: 'integer', minimum: 12 });
        expect(prop1).toHaveProperty('minimum', 12);

        const prop2 = schema.setProperty('prop2', { type: 'integer', maximum: 25 });
        expect(prop2).toHaveProperty('maximum', 25);

        const prop3 = schema.setProperty('prop3', { type: 'integer', minimum: 12, maximum: 30 });
        expect(prop3).toHaveProperty('minimum', 12);
        expect(prop3).toHaveProperty('maximum', 30);

        const prop4 = schema.setProperty('prop4', { type: 'integer', exclusiveMinimum: 12 });
        expect(prop4).toHaveProperty('exclusiveMinimum', 12);

        const prop5 = schema.setProperty('prop5', { type: 'integer', exclusiveMaximum: 25 });
        expect(prop5).toHaveProperty('exclusiveMaximum', 25);

        const prop6 = schema.setProperty('prop6', {
          type: 'integer',
          exclusiveMinimum: 12,
          exclusiveMaximum: 30,
        });
        expect(prop6).toHaveProperty('exclusiveMinimum', 12);
        expect(prop6).toHaveProperty('exclusiveMaximum', 30);
      });
    });

    describe('date types', () => {
      test('defaults', () => {
        const dateProp = schema.setProperty('dateProp', 'date');
        expect(dateProp).toHaveProperty('type', 'string');
        expect(dateProp).toHaveProperty('format', 'date');
        expect(dateProp).toHaveProperty('enum', null);
        expect(dateProp).toHaveProperty('default', null);

        const dateTimeProp = schema.setProperty('dateTimeProp', 'date-time');
        expect(dateTimeProp).toHaveProperty('type', 'string');
        expect(dateTimeProp).toHaveProperty('format', 'date-time');
        expect(dateTimeProp).toHaveProperty('enum', null);
        expect(dateTimeProp).toHaveProperty('default', null);
      });

      test('enum', () => {
        const enumValues = ['2022-12-12'];
        const enumProp = schema.setProperty('enumProp', { type: 'date', enum: enumValues });
        expect(enumProp).toHaveProperty('enum', ['2022-12-12']);

        enumValues.push('2022-01-01');
        expect(enumProp).toHaveProperty('enum', ['2022-12-12']);
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

    describe('string property', () => {
      test('enum', () => {
        const genderEnum = ['male', 'female'];
        const genderProp = schema.setProperty('gender', { type: 'string', enum: genderEnum });
        expect(genderProp).toHaveProperty('enum', ['male', 'female']);

        genderEnum.push('non-binary');
        expect(genderProp).toHaveProperty('enum', ['male', 'female']);
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
    expect(schema.allOf).toStrictEqual([]);

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

    expect(schema.allOf).toStrictEqual([]);
  });

  test('clearAllOf', () => {
    const openapi = new OpenAPI('example', '0.1.0');
    const schema = SchemaFactory.create(openapi.components, null);
    schema.addAllOf('integer');
    schema.addAllOf('double');

    expect(schema.allOf).toHaveLength(2);

    schema.clearAllOf();

    expect(schema.allOf).toStrictEqual([]);
  });

  test('addOneOf', () => {
    const openapi = new OpenAPI('example', '0.1.0');

    const schema = SchemaFactory.create(openapi.components, null);
    expect(schema.allOf).toStrictEqual([]);

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

    expect(schema.oneOf).toStrictEqual([]);
  });

  test('clearOneOf', () => {
    const openapi = new OpenAPI('example', '0.1.0');
    const schema = SchemaFactory.create(openapi.components, null);
    schema.addOneOf('integer');
    schema.addOneOf('double');

    expect(schema.oneOf).toHaveLength(2);

    schema.clearOneOf();

    expect(schema.oneOf).toStrictEqual([]);
  });

  test('arrayOf', () => {
    const openapi = new OpenAPI('example', '0.1.0');
    const itemSchema = SchemaFactory.create(openapi.components, 'integer');

    const arraySchema = itemSchema.arrayOf(openapi.components);

    expect(arraySchema.items).toBe(itemSchema);
  });
});

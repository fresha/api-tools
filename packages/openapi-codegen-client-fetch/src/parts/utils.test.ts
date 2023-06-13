import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { propertyName, schemaToType } from './utils';

const normalize = (raw: string): string => {
  return raw
    .split(/\s+/)
    .map(line => line.trim())
    .join(' ');
};

test('properyName', () => {
  expect(propertyName('foo', 'camel')).toBe('foo');
  expect(propertyName('foo-bar', 'camel')).toBe('fooBar');
  expect(propertyName('foo-19', 'kebab')).toBe("'foo-19'");
  expect(propertyName('foo-bar', 'kebab')).toBe("'foo-bar'");
  expect(propertyName('foo_bar', 'title')).toBe('FooBar');
  expect(propertyName('foo_bar', 'kebab')).toBe("'foo-bar'");
});

describe('schemaToType', () => {
  let openapi: OpenAPIModel;

  beforeEach(() => {
    openapi = OpenAPIFactory.create();
  });

  test('simple cases', () => {
    expect(schemaToType(openapi.components.setSchema('Null'), 'camel')).toMatch(/^Unknown\d+/);
    expect(schemaToType(openapi.components.setSchema('Boolean', 'boolean'), 'kebab')).toBe(
      'boolean',
    );
    expect(schemaToType(openapi.components.setSchema('Integer', 'integer'), 'snake')).toBe(
      'number',
    );
    expect(schemaToType(openapi.components.setSchema('Number', 'number'), 'title')).toBe('number');
    expect(schemaToType(openapi.components.setSchema('String', 'string'), 'camel')).toBe('string');

    const nullableBoolean = openapi.components.setSchema('NullableBoolean', 'boolean');
    nullableBoolean.nullable = true;
    expect(schemaToType(nullableBoolean, 'camel')).toBe('boolean | null');

    const nullableNumber = openapi.components.setSchema('NullableNumber', 'number');
    nullableNumber.nullable = true;
    expect(schemaToType(nullableNumber, 'kebab')).toBe('number | null');

    const nullableString = openapi.components.setSchema('NullableString', 'string');
    nullableString.nullable = true;
    expect(schemaToType(nullableString, 'snake')).toBe('string | null');
  });

  test('numeric enum', () => {
    const enumInteger = openapi.components.setSchema('EnumInt', 'integer');
    enumInteger.addAllowedValues(1, 3, 2, 8);

    expect(schemaToType(enumInteger, 'snake')).toBe('1 | 3 | 2 | 8');

    enumInteger.nullable = true;

    expect(schemaToType(enumInteger, 'title')).toBe('1 | 3 | 2 | 8 | null');
  });

  test('string enum', () => {
    const enumString = openapi.components.setSchema('EnumString', 'string');
    enumString.addAllowedValues('val1', 'val2');

    expect(schemaToType(enumString, 'kebab')).toBe("'val1' | 'val2'");

    enumString.nullable = true;

    expect(schemaToType(enumString, 'snake')).toBe("'val1' | 'val2' | null");
  });

  test('array schema', () => {
    const arraySchema = openapi.components.setSchema('Array', 'array');
    arraySchema.setItems('string');

    expect(schemaToType(arraySchema, 'snake')).toBe('string[]');

    arraySchema.nullable = true;

    expect(schemaToType(arraySchema, 'title')).toBe('string[] | null');
  });

  test('object schema', () => {
    const objectSchema = openapi.components.setSchema('Object', 'object');
    objectSchema.setProperties({
      prop1: 'string',
      prop2: 'integer',
      'prop3-x-val': {
        type: 'array',
        items: 'boolean',
        nullable: true,
        required: true,
      },
    });

    expect(schemaToType(objectSchema, 'camel')).toBe(
      '{ prop1?: string; prop2?: number; prop3XVal: boolean[] | null }',
    );
  });

  test('deeply nested schema', () => {
    const complexSchema = openapi.components.setSchema('ComplexSchema', 'object');
    complexSchema.setProperties({
      name: { type: 'string', required: true },
      age: { type: 'integer', required: true, nullable: true },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string', required: true },
          city: { type: 'string', required: true },
          country: { type: 'string', required: true },
          'postal-code': { type: 'string', required: false },
        },
        required: true,
      },
      phones: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            number: { type: 'string', required: true },
            type: { type: 'string', required: true, enum: ['home', 'work', 'mobile'] },
          },
        },
      },
    });

    expect(schemaToType(complexSchema, 'camel')).toBe(
      normalize(`{
      name: string;
      age: number | null;
      address: {
        street: string;
        city: string;
        country: string;
        postalCode?: string
      };
      phones?: {
        number: string;
        type: 'home' | 'work' | 'mobile'
      }[]
    }`),
    );
  });
});

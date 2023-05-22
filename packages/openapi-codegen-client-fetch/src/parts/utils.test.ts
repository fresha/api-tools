import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { schemaToType } from './utils';

const normalize = (raw: string): string => {
  return raw
    .split(/\s+/)
    .map(line => line.trim())
    .join(' ');
};

describe('schemaToType', () => {
  let openapi: OpenAPIModel;

  beforeEach(() => {
    openapi = OpenAPIFactory.create();
  });

  test('simple cases', () => {
    expect(schemaToType(openapi.components.setSchema('Null'))).toMatch(/^Unknown\d+/);
    expect(schemaToType(openapi.components.setSchema('Boolean', 'boolean'))).toBe('boolean');
    expect(schemaToType(openapi.components.setSchema('Integer', 'integer'))).toBe('number');
    expect(schemaToType(openapi.components.setSchema('Number', 'number'))).toBe('number');
    expect(schemaToType(openapi.components.setSchema('String', 'string'))).toBe('string');

    const nullableBoolean = openapi.components.setSchema('NullableBoolean', 'boolean');
    nullableBoolean.nullable = true;
    expect(schemaToType(nullableBoolean)).toBe('boolean | null');

    const nullableNumber = openapi.components.setSchema('NullableNumber', 'number');
    nullableNumber.nullable = true;
    expect(schemaToType(nullableNumber)).toBe('number | null');

    const nullableString = openapi.components.setSchema('NullableString', 'string');
    nullableString.nullable = true;
    expect(schemaToType(nullableString)).toBe('string | null');
  });

  test('numeric enum', () => {
    const enumInteger = openapi.components.setSchema('EnumInt', 'integer');
    enumInteger.addAllowedValues(1, 3, 2, 8);

    expect(schemaToType(enumInteger)).toBe('1 | 3 | 2 | 8');

    enumInteger.nullable = true;

    expect(schemaToType(enumInteger)).toBe('1 | 3 | 2 | 8 | null');
  });

  test('string enum', () => {
    const enumString = openapi.components.setSchema('EnumString', 'string');
    enumString.addAllowedValues('val1', 'val2');

    expect(schemaToType(enumString)).toBe("'val1' | 'val2'");

    enumString.nullable = true;

    expect(schemaToType(enumString)).toBe("'val1' | 'val2' | null");
  });

  test('array schema', () => {
    const arraySchema = openapi.components.setSchema('Array', 'array');
    arraySchema.setItems('string');

    expect(schemaToType(arraySchema)).toBe('string[]');

    arraySchema.nullable = true;

    expect(schemaToType(arraySchema)).toBe('string[] | null');
  });

  test('object schema', () => {
    const objectSchema = openapi.components.setSchema('Object', 'object');
    objectSchema.setProperties({
      prop1: 'string',
      prop2: 'integer',
      'prop3-x': {
        type: 'array',
        items: 'boolean',
        nullable: true,
        required: true,
      },
    });

    expect(schemaToType(objectSchema)).toBe(
      "{ prop1?: string; prop2?: number; 'prop3-x': boolean[] | null }",
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

    expect(schemaToType(complexSchema)).toBe(
      normalize(`{
      name: string;
      age: number | null;
      address: {
        street: string;
        city: string;
        country: string
      };
      phones?: {
        number: string;
        type: 'home' | 'work' | 'mobile'
      }[]
    }`),
    );
  });
});

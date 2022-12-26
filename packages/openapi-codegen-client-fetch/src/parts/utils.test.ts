import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';

import { schemaToType } from './utils';

describe('schemaToType', () => {
  test('simple cases', () => {
    const openapi = OpenAPIFactory.create();

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
    const openapi = OpenAPIFactory.create();

    const enumInteger = openapi.components.setSchema('EnumInt', 'integer');
    enumInteger.enum = [1, 3, 2, 8];

    expect(schemaToType(enumInteger)).toBe('1 | 3 | 2 | 8');

    enumInteger.nullable = true;

    expect(schemaToType(enumInteger)).toBe('1 | 3 | 2 | 8 | null');
  });

  test('string enum', () => {
    const openapi = OpenAPIFactory.create();

    const enumString = openapi.components.setSchema('EnumString', 'string');
    enumString.enum = ['val1', 'val2'];

    expect(schemaToType(enumString)).toBe("'val1' | 'val2'");

    enumString.nullable = true;

    expect(schemaToType(enumString)).toBe("'val1' | 'val2' | null");
  });
});

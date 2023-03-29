import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { schemaToType } from './utils';

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
});

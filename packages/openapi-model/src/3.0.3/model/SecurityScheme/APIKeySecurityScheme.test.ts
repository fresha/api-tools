import { OpenAPIFactory } from '../OpenAPI';

import type { APIKeySecurityScheme } from './APIKeySecurityScheme';
import type { APIKeySecuritySchemaModelLocation } from '../types';

let schema: APIKeySecurityScheme;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  schema = openapi.components.setSecuritySchema('key', 'apiKey') as APIKeySecurityScheme;
});

test('defaults', () => {
  expect(schema.name).toBe('key');
  expect(schema.in).toBe('header');
});

test('mutations', () => {
  schema.name = 'key2';
  expect(schema.name).toBe('key2');
  expect(schema.root.components.getSecuritySchema('key')).toBe(schema);

  schema.in = 'query';
  expect(schema.in).toBe('query');

  expect(() => {
    schema.in = 'invalid' as APIKeySecuritySchemaModelLocation;
  }).toThrow();
});

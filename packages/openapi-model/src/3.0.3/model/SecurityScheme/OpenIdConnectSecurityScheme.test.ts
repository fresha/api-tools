import { OpenAPIFactory } from '../OpenAPI';

import { OpenIdConnectSecurityScheme } from './OpenIdConnectSecurityScheme';

let schema: OpenIdConnectSecurityScheme;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  schema = openapi.components.setSecuritySchema(
    'key',
    'openIdConnect',
  ) as OpenIdConnectSecurityScheme;
});

test('defaults', () => {
  expect(schema.openIdConnectUrl).toBe('http://www.example.com');
});

test('mutations', () => {
  schema.openIdConnectUrl = 'http://www.example.com/2';
  expect(schema.openIdConnectUrl).toBe('http://www.example.com/2');

  expect(() => {
    schema.openIdConnectUrl = 'invalid/url';
  }).toThrow();
});

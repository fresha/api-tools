import { OpenAPIFactory } from '../OpenAPI';

import { OpenIdConnectSecurityScheme } from './OpenIdConnectSecurityScheme';

let schema: OpenIdConnectSecurityScheme;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  schema = openapi.components.setSecuritySchema(
    'key',
    'openIdConnect',
    'https://oid.example.com/auth',
  ) as OpenIdConnectSecurityScheme;
});

test('defaults', () => {
  expect(schema.openIdConnectUrl).toBe('https://oid.example.com/auth');
});

test('mutations', () => {
  schema.openIdConnectUrl = 'http://www.example.com/2';
  expect(schema.openIdConnectUrl).toBe('http://www.example.com/2');

  expect(() => {
    schema.openIdConnectUrl = 'invalid/url';
  }).toThrow();
});

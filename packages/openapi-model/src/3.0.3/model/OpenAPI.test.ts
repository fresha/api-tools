import { OpenAPI } from './OpenAPI';

test('ownership', () => {
  const openapi = new OpenAPI('example', '0.1.0');
  expect(openapi.root).toBe(openapi);

  expect(openapi.info.parent).toBe(openapi);
  expect(openapi.info.contact.parent).toBe(openapi.info);
  expect(openapi.info.license.parent).toBe(openapi.info);
});

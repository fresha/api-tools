import { OpenAPIFactory } from '../OpenAPI';
import { CookieParameterSerializationStyle } from '../types';

import { CookieParameter } from './CookieParameter';

let param: CookieParameter;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  param = openapi.components.setParameter('key', 'cookie', 'q') as CookieParameter;
});

test('defaults', () => {
  expect(param.style).toBe('form');
  expect(param.explode).toBe(true);
  expect(param.required).toBe(false);
});

test('mutations', () => {
  expect(() => {
    param.style = 'matrix' as CookieParameterSerializationStyle;
  }).toThrow();

  param.required = true;
  expect(param.required).toBe(true);
});

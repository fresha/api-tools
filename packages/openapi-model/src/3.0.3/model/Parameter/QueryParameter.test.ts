import { OpenAPIFactory } from '../OpenAPI';

import type { QueryParameter } from './QueryParameter';
import type { QueryParameterSerializationStyle } from '../types';

let param: QueryParameter;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  param = openapi.components.setParameter('key', 'query', 'q') as QueryParameter;
});

test('defaults', () => {
  expect(param.style).toBe('form');
  expect(param.explode).toBe(true);
  expect(param.required).toBe(false);
  expect(param.allowEmptyValue).toBe(false);
  expect(param.allowReserved).toBe(false);
});

test('mutations', () => {
  param.style = 'spaceDelimited';
  expect(param.style).toBe('spaceDelimited');
  expect(() => {
    param.style = 'matrix' as QueryParameterSerializationStyle;
  }).toThrow();

  param.required = true;
  expect(param.required).toBe(true);

  param.allowEmptyValue = true;
  expect(param.allowEmptyValue).toBe(true);

  param.allowReserved = true;
  expect(param.allowReserved).toBe(true);
});

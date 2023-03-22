import { OpenAPIFactory } from '../OpenAPI';

import type { PathParameter } from './PathParameter';
import type { PathParameterSerializationStyle } from '../types';

let param: PathParameter;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  param = openapi.components.setParameter('key', 'path', 'p') as PathParameter;
});

test('defaults', () => {
  expect(param.style).toBe('simple');
  expect(param.explode).toBe(false);
  expect(param.required).toBe(true);
});

test('style', () => {
  expect(param.style).toBe('simple');
  param.style = 'label';
  expect(param.style).toBe('label');

  expect(() => {
    param.style = 'deepObject' as PathParameterSerializationStyle;
  }).toThrow();
});

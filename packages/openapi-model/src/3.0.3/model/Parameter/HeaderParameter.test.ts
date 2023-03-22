import { OpenAPIFactory } from '../OpenAPI';

import type { HeaderParameter } from './HeaderParameter';
import type { HeaderParameterSerializationStyle } from '../types';

let param: HeaderParameter;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  param = openapi.components.setParameter('key', 'header', 'q') as HeaderParameter;
});

test('defaults', () => {
  expect(param.required).toBe(false);
  expect(param.style).toBe('simple');
});

test('mutations', () => {
  param.required = true;
  expect(param.required).toBe(true);

  expect(() => {
    param.style = 'deepObject' as HeaderParameterSerializationStyle;
  }).toThrow();
});

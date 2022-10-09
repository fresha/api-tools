import { OpenAPIFactory } from '../OpenAPI';

import { ParameterBase } from './ParameterBase';

class Param extends ParameterBase {}

let param = {} as ParameterBase;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  param = new Param(openapi.components, 'path', 'x');
});

test('getExample + getExampleOrThrow', () => {
  param.setExample('json');
  param.setExample('xml');

  expect(param.getExample('json')).not.toBeUndefined();
  expect(param.getExample('wrong')).toBeUndefined();
  expect(param.getExampleOrThrow('xml')).not.toBeUndefined();
  expect(() => param.getExampleOrThrow('wrong')).toThrow();
});

test('getContent + getContentOrThrow', () => {
  param.setContent('application/json');
  param.setContent('application/xml');

  expect(param.getContent('application/json')).not.toBeUndefined();
  expect(param.getContent('wrong')).toBeUndefined();
  expect(param.getContentOrThrow('application/xml')).not.toBeUndefined();
  expect(() => param.getContentOrThrow('wrong')).toThrow();
});

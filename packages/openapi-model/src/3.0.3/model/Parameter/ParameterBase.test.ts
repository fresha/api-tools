import { OpenAPIFactory } from '../OpenAPI';

import { ParameterBase } from './ParameterBase';

class Param extends ParameterBase<'path'> {}

let param: Param;

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
  param.setMediaType('application/json');
  param.setMediaType('application/xml');

  expect(param.getMediaType('application/json')).not.toBeUndefined();
  expect(param.getMediaType('wrong')).toBeUndefined();
  expect(param.getMediaTypeOrThrow('application/xml')).not.toBeUndefined();
  expect(() => param.getMediaTypeOrThrow('wrong')).toThrow();
});

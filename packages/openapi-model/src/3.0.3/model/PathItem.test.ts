import { OpenAPIFactory } from './OpenAPI';

let openapi = OpenAPIFactory.create();

beforeEach(() => {
  openapi = OpenAPIFactory.create();
});

test('.pathUrl', () => {
  const item = openapi.setPathItem('/hello/{uid}');
  expect(item.pathUrl).toBe('/hello/{uid}');
});

describe('operations()', () => {
  test('sparse', () => {
    const pathItem = openapi.setPathItem('/health');
    pathItem.setOperation('get');
    pathItem.setOperation('delete');

    expect(Array.from(pathItem.operations(), ([key]) => key)).toStrictEqual(['get', 'delete']);
  });

  test('sorting', () => {
    const pathItem = openapi.setPathItem('/health');
    pathItem.setOperation('trace');
    pathItem.setOperation('options');
    pathItem.setOperation('head');
    pathItem.setOperation('delete');
    pathItem.setOperation('patch');
    pathItem.setOperation('get');
    pathItem.setOperation('put');
    pathItem.setOperation('post');

    expect(Array.from(pathItem.operations(), ([key]) => key)).toStrictEqual([
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'options',
      'head',
      'trace',
    ]);
  });
});

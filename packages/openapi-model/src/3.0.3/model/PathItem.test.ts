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
    pathItem.addOperation('get');
    pathItem.addOperation('delete');

    expect(Array.from(pathItem.operations(), ([key]) => key)).toStrictEqual(['get', 'delete']);
  });

  test('sorting', () => {
    const pathItem = openapi.setPathItem('/health');
    pathItem.addOperation('trace');
    pathItem.addOperation('options');
    pathItem.addOperation('head');
    pathItem.addOperation('delete');
    pathItem.addOperation('patch');
    pathItem.addOperation('get');
    pathItem.addOperation('put');
    pathItem.addOperation('post');

    expect(new Set<string>(pathItem.operationMethods())).toStrictEqual(
      new Set<string>(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']),
    );
  });
});

import { OpenAPIFactory } from './OpenAPI';

import type { OpenAPIModel, PathItemModel } from './types';

let openapi: OpenAPIModel;
let pathItem: PathItemModel;

beforeEach(() => {
  openapi = OpenAPIFactory.create();
  pathItem = openapi.setPathItem('/health');
});

test('.pathUrl', () => {
  const item = openapi.setPathItem('/hello/{uid}');
  expect(item.pathUrl).toBe('/hello/{uid}');
});

describe('operations()', () => {
  test('default', () => {
    expect(pathItem.operationCount).toBe(0);
    expect([...pathItem.operationMethods()]).toStrictEqual([]);
  });

  test('operations', () => {
    const opGet = pathItem.addOperation('get');
    pathItem.addOperation('delete');

    expect(pathItem.operationCount).toBe(2);
    expect(Array.from(pathItem.operations(), ([key]) => key)).toStrictEqual(['get', 'delete']);

    expect(pathItem.hasOperation('get')).toBeTruthy();
    expect(pathItem.hasOperation('patch')).toBeFalsy();

    expect(pathItem.getOperation('get')).toBe(opGet);
    expect(pathItem.getOperationKeyOrThrow(opGet)).toBe('get');

    expect(() => pathItem.getOperationOrThrow('put')).toThrow();

    pathItem.deleteOperation('get');
    expect(pathItem.operationCount).toBe(1);

    pathItem.clearOperations();
    expect(pathItem.operationCount).toBe(0);
  });

  test('server collection', () => {
    expect(pathItem.serverCount).toBe(0);

    pathItem.addServer('http://first.example.com');
    const server2 = pathItem.addServer('http://second.example.com');
    expect(pathItem.serverCount).toBe(2);
    expect(pathItem.serverAt(1)).toBe(server2);

    expect(() => pathItem.addServer('http://first.example.com')).toThrow();

    pathItem.deleteServerAt(0);
    expect(pathItem.serverAt(0)).toBe(server2);

    pathItem.addServer('http://third.example.com');
    expect(Array.from(pathItem.servers(), ({ url }) => url)).toStrictEqual([
      'http://second.example.com',
      'http://third.example.com',
    ]);

    pathItem.deleteServer('http://fourth.example.com');
    pathItem.deleteServer('http://third.example.com');
    expect(Array.from(pathItem.servers(), ({ url }) => url)).toStrictEqual([
      'http://second.example.com',
    ]);

    pathItem.clearServers();
    expect(pathItem.serverCount).toBe(0);
  });
});

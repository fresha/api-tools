import { OpenAPIFactory, OperationModel } from '@fresha/openapi-model/build/3.0.3';

import {
  pathUrlToUrlExp,
  getAPIName,
  getOperationEntryKey,
  getOperationEntryKeyOrThrow,
  getOperationId,
  getOperationIdOrThrow,
  getRootUrl,
  getRootUrlOrThrow,
  getOperationCacheOptionsOrThrow,
  getOperationCacheOptions,
  getOperations,
} from './openapi';

test('getAPIName', () => {
  const openapi = OpenAPIFactory.create('Some Api', '0.1.2');
  expect(getAPIName(openapi)).toBe('Some Api');
});

test('getRootUrl', () => {
  const openapi = OpenAPIFactory.create();

  expect(getRootUrl(openapi)).toBeUndefined();

  openapi.paths.setExtension('root-url', 'http://www.example.com');
  expect(getRootUrl(openapi)).toBe('http://www.example.com');

  openapi.paths.setExtension('root-url', 234);
  expect(() => getRootUrl(openapi)).toThrow();
});

test('getRootUrlOrThrow', () => {
  const openapi = OpenAPIFactory.create();

  expect(() => getRootUrlOrThrow(openapi)).toThrow();

  openapi.paths.setExtension('root-url', '');
  expect(() => getRootUrlOrThrow(openapi)).toThrow();

  openapi.paths.setExtension('root-url', 'https://www.example.com');
  expect(getRootUrlOrThrow(openapi)).toBe('https://www.example.com');
});

test('getOperations', () => {
  const openapi = OpenAPIFactory.create();

  openapi.addTag('t1');
  openapi.addTag('t2');

  const pathItem1 = openapi.setPathItem('/hello');

  const op1 = pathItem1.setOperation('get');
  op1.operationId = 'readHello';
  op1.deprecated = true;
  op1.addTag('t1');

  const op2 = pathItem1.setOperation('post');
  op2.operationId = 'createGreeting';
  op2.addTag('t1');
  op2.addTag('t2');

  const pathItem2 = openapi.setPathItem('/world');

  const op3 = pathItem2.setOperation('delete');
  op3.operationId = 'deleteWorldInfo';
  op3.deprecated = true;

  const op4 = pathItem2.setOperation('get');
  op4.operationId = 'fetchWorldInfo';
  op4.addTag('t2');

  const getOperationNames = (it: IterableIterator<OperationModel>): Set<string> => {
    return new Set<string>(Array.from(it, op => op.operationId ?? ''));
  };

  const noDeprecatedOps = getOperationNames(getOperations(openapi));
  expect(noDeprecatedOps).toStrictEqual(new Set<string>(['createGreeting', 'fetchWorldInfo']));

  const allOps = getOperationNames(getOperations(openapi, { deprecated: true }));
  expect(allOps).toStrictEqual(
    new Set<string>(['readHello', 'createGreeting', 'fetchWorldInfo', 'deleteWorldInfo']),
  );

  const notDeprecatedTag1Ops = getOperationNames(getOperations(openapi, { tags: ['t1'] }));
  expect(new Set<string>(notDeprecatedTag1Ops)).toStrictEqual(new Set<string>(['createGreeting']));

  const tag1Ops = getOperationNames(getOperations(openapi, { tags: ['t1'], deprecated: true }));
  expect(tag1Ops).toStrictEqual(new Set<string>(['readHello', 'createGreeting']));
});

test('getOperationEntryKey', () => {
  const openapi = OpenAPIFactory.create();
  const operation = openapi.setPathItem('/op').setOperation('get');

  expect(getOperationEntryKey(operation)).toBeUndefined();

  operation.setExtension('entry-key', 'https://www.example.com');
  expect(getOperationEntryKey(operation)).toBe('https://www.example.com');

  operation.setExtension('entry-key', null);
  expect(() => getOperationEntryKey(operation)).toThrow();
});

test('getOperationEntryKeyOrThrow', () => {
  const openapi = OpenAPIFactory.create();
  const operation = openapi.setPathItem('/op').setOperation('get');

  expect(() => getOperationEntryKeyOrThrow(operation)).toThrow();

  operation.setExtension('entry-key', 'https://www.example.com');
  expect(getOperationEntryKeyOrThrow(operation)).toBe('https://www.example.com');

  operation.setExtension('entry-key', '');
  expect(() => getOperationEntryKeyOrThrow(operation)).toThrow();
});

describe('getOperationId', () => {
  let operation = OpenAPIFactory.create().setPathItem('/op1').setOperation('get');

  beforeEach(() => {
    operation = OpenAPIFactory.create().setPathItem('/op1').setOperation('get');
  });

  test('undefined', () => {
    expect(getOperationId(operation)).toBeUndefined();
  });

  test('operationId', () => {
    operation.operationId = 'op1';
    expect(getOperationId(operation)).toBe('op1');
  });

  test('x-codegen-operation', () => {
    operation.setExtension('codegen-operation', 'op2');
    expect(getOperationId(operation)).toBe('op2');
  });

  test('operationId has priority over x-codegen-operation', () => {
    operation.operationId = 'op1';
    operation.setExtension('codegen-operation', 'op2');
    expect(getOperationId(operation)).toBe('op1');
  });
});

test('getOperationIdOrThrow', () => {
  const operation = OpenAPIFactory.create().setPathItem('/op1').setOperation('get');

  expect(() => getOperationIdOrThrow(operation)).toThrow();

  operation.operationId = 'op3';
  expect(getOperationIdOrThrow(operation)).toBe('op3');
});

test('getOperationCacheOptions', () => {
  const openapi = OpenAPIFactory.create();
  const operation = openapi.setPathItem('/op').setOperation('get');

  expect(getOperationCacheOptions(operation)).toBeUndefined();

  operation.setExtension('cache', 'https://www.example.com');
  expect(() => getOperationCacheOptions(operation)).toThrow();

  operation.setExtension('cache', null);
  expect(() => getOperationCacheOptions(operation)).toThrow();

  operation.setExtension('cache', 60);
  expect(getOperationCacheOptions(operation)).toBe(60);

  operation.setExtension('cache', false);
  expect(getOperationCacheOptions(operation)).toBe(false);

  operation.setExtension('cache', true);
  expect(getOperationCacheOptions(operation)).toBe(true);
});

test('getOperationCacheOptionsOrThrow', () => {
  const operation = OpenAPIFactory.create().setPathItem('/op1').setOperation('get');

  expect(() => getOperationIdOrThrow(operation)).toThrow();

  operation.setExtension('cache', 10);
  expect(getOperationCacheOptionsOrThrow(operation)).toBe(10);
});

test('pathUrlToUrlExp', () => {
  expect(pathUrlToUrlExp('/employees')).toBe('employees');
  expect(pathUrlToUrlExp('/employees/{id}/pets/{status}')).toBe('employees/:id/pets/:status');
});

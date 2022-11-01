import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';

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

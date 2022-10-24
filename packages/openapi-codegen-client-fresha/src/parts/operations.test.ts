import { PathItemOperationKey } from '@fresha/openapi-model/build/3.0.3';

import { findOperationTemplate } from './operations';

describe('findOperationTemplate', () => {
  test('get without ID maps to single-read, if generated action name is identical', () => {
    expect(findOperationTemplate('get', '/', 'employee', 'readEmployee')).toHaveProperty(
      'name',
      'single-read',
    );
  });

  test('if generated action name for single-read differs from operationId, get without ID maps to list', () => {
    expect(findOperationTemplate('get', '/', 'employee', 'readEmployeeList')).toHaveProperty(
      'name',
      'list',
    );
  });

  test('get with ID maps to read', () => {
    expect(
      findOperationTemplate('get', '/employees/{id}', 'entryKey', 'operationId'),
    ).toHaveProperty('name', 'read');
  });

  test('put without ID maps to single-update', () => {
    expect(findOperationTemplate('put', '/', 'entryKey', 'operationId')).toHaveProperty(
      'name',
      'single-update',
    );
  });

  test('put with ID maps to update', () => {
    expect(
      findOperationTemplate('put', '/employees/{id}', 'entryKey', 'operationId'),
    ).toHaveProperty('name', 'update');
  });

  test('patch without ID maps to single-patch', () => {
    expect(findOperationTemplate('patch', '/', 'entryKey', 'operationId')).toHaveProperty(
      'name',
      'single-patch',
    );
  });

  test('patch with ID maps to patch', () => {
    expect(
      findOperationTemplate('patch', '/employees/{id}', 'entryKey', 'operationId'),
    ).toHaveProperty('name', 'patch');
  });

  test('delete without ID maps to single-delete', () => {
    expect(findOperationTemplate('delete', '/', 'entryKey', 'operationId')).toHaveProperty(
      'name',
      'single-delete',
    );
  });

  test('delete with ID maps to delete', () => {
    expect(
      findOperationTemplate('delete', '/employees/{id}', 'entryKey', 'operationId'),
    ).toHaveProperty('name', 'delete');
  });

  test('throw on unsupported methods', () => {
    expect(() => findOperationTemplate('options', '/', 'entryKey', 'operationId')).toThrow();
    expect(() => findOperationTemplate('head', '/', 'entryKey', 'operationId')).toThrow();
    expect(() => findOperationTemplate('trace', '/', 'entryKey', 'operationId')).toThrow();
    expect(() =>
      findOperationTemplate(
        'i-am-a-teapot' as PathItemOperationKey,
        '/',
        'entryKey',
        'operationId',
      ),
    ).toThrow();
  });
});

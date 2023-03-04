import { OpenAPIFactory } from './OpenAPI';

import type { EncodingModel } from './types';

let encoding: EncodingModel = {} as EncodingModel;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  const requestBody = openapi.components.setRequestBody('RequestBody');
  const mediaType = requestBody.setMediaType('application/json');
  encoding = mediaType.setEncoding('application/json');
});

test('default properties', () => {
  expect(encoding).toHaveProperty('contentType', 'application/json');
  expect(encoding.headerCount).toBe(0);
  expect(encoding).toHaveProperty('style', 'form');
  expect(encoding).toHaveProperty('explode', false);
  expect(encoding).toHaveProperty('allowReserved', false);
});

describe('header collection', () => {
  test('getHeader + getHeaderOrThrow', () => {
    encoding.setHeader('Accept');
    encoding.setHeader('Content-Length');

    expect(encoding.getHeader('Accept')).not.toBeUndefined();
    expect(encoding.getHeader('-')).toBeUndefined();
    expect(encoding.getHeaderOrThrow('Content-Length')).not.toBeUndefined();
    expect(() => encoding.getHeaderOrThrow('?')).toThrow();
  });

  test('setHeader', () => {
    encoding.setHeader('Accept');
    expect(encoding.getHeader('Accept')).not.toBeNull();
  });

  test('deleteHeader', () => {
    encoding.setHeader('Accept');
    encoding.setHeader('Content-Length');

    expect(encoding.headerCount).toBe(2);

    encoding.deleteHeader('Accept');

    expect(encoding.headerCount).toBe(1);
    expect(encoding.getHeader('Accept')).toBeFalsy();
  });

  test('clearHeaders', () => {
    encoding.setHeader('Accept');
    encoding.setHeader('Content-Length');

    encoding.clearHeaders();

    expect(encoding.headerCount).toBe(0);
  });
});

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
    const h1 = encoding.setHeader('Accept');
    const h2 = encoding.setHeader('Content-Length');

    expect([...encoding.headerKeys()]).toStrictEqual(['Accept', 'Content-Length']);
    expect([...encoding.headers()]).toStrictEqual([
      ['Accept', h1],
      ['Content-Length', h2],
    ]);
    expect(encoding.hasHeader('Accept')).toBeTruthy();
    expect(encoding.hasHeader('X-Rate-Limit')).toBeFalsy();
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

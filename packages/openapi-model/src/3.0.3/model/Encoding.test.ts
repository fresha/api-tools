import { OpenAPIFactory } from './OpenAPI';

import type { EncodingModel } from './types';

let encoding: EncodingModel | null = null;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  const requestBody = openapi.components.setRequestBody('RequestBody');
  const mediaType = requestBody.setContent('application/json');
  encoding = mediaType.setEncoding('application/json');
});

test('default properties', () => {
  expect(encoding).toHaveProperty('contentType', 'application/json');
  expect(encoding?.headers).toHaveProperty('size', 0);
  expect(encoding).toHaveProperty('style', 'form');
  expect(encoding).toHaveProperty('explode', false);
  expect(encoding).toHaveProperty('allowReserved', false);
});

describe('header collection', () => {
  test('setHeader', () => {
    encoding?.setHeader('Accept');
    expect(encoding?.headers.get('Accept')).not.toBeNull();
  });

  test('deleteHeader', () => {
    encoding?.setHeader('Accept');
    encoding?.setHeader('Content-Length');

    expect(encoding?.headers.size).toBe(2);

    encoding?.deleteHeader('Accept');

    expect(encoding?.headers.size).toBe(1);
    expect(encoding?.headers.get('Accept')).toBeFalsy();
  });

  test('clearHeaders', () => {
    encoding?.setHeader('Accept');
    encoding?.setHeader('Content-Length');

    encoding?.clearHeaders();

    expect(encoding?.headers.size).toBe(0);
  });
});

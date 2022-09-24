import { OpenAPIFactory } from './OpenAPI';

import type { MediaTypeModel } from './types';

let mediaType: MediaTypeModel | null = null;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  const requestBody = openapi.components.setRequestBody('RequestBody');
  mediaType = requestBody.setContent('application/json');
});

test('default properties', () => {
  expect(mediaType?.schema).toBeNull();
  expect(mediaType?.example).toBeNull();
  expect(mediaType?.examples).toHaveProperty('size', 0);
  expect(mediaType?.encoding).toHaveProperty('size', 0);
});

test('schema property', () => {
  mediaType?.setSchema('date-time');

  expect(mediaType?.schema).toHaveProperty('type', 'string');
  expect(mediaType?.schema).toHaveProperty('format', 'date-time');

  mediaType?.deleteSchema();

  expect(mediaType?.schema).toBeNull();
});

test('examples collection', () => {
  mediaType?.setExample('1');
  mediaType?.setExample('2');
  mediaType?.setExample('3');

  expect(mediaType?.examples).toHaveProperty('size', 3);

  mediaType?.deleteExample('2');

  expect(Array.from(mediaType?.examples.keys() ?? [])).toStrictEqual(['1', '3']);

  mediaType?.clearExamples();

  expect(mediaType?.examples).toHaveProperty('size', 0);
});

test('either example or examples can be set', () => {
  mediaType!.example = {};
  expect(() => mediaType?.setExample('1')).toThrow();
});

test('encoding collection', () => {
  mediaType?.setEncoding('1');
  mediaType?.setEncoding('2');
  mediaType?.setEncoding('3');

  expect(mediaType?.encoding).toHaveProperty('size', 3);

  mediaType?.deleteEncoding('2');

  expect(Array.from(mediaType?.encoding.keys() ?? [])).toStrictEqual(['1', '3']);

  mediaType?.clearEncodings();

  expect(mediaType?.encoding).toHaveProperty('size', 0);
});

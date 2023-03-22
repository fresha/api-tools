import { OpenAPIFactory } from '../OpenAPI';

import { ParameterBase } from './ParameterBase';

import type { Example } from '../Example';
import type { MediaType } from '../MediaType';

class Param extends ParameterBase<'path'> {}

let param: Param;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  param = new Param(openapi.components, 'path', 'x');
});

test('schema', () => {
  expect(param.schema).toBeNull();

  const schema = param.setSchema({ type: 'string' });
  expect(schema.parent).toBe(param);
  expect(param.schema).toBe(schema);

  expect(() => param.setSchema({ type: 'string' })).toThrow();

  param.deleteSchema();

  expect(param.schema).toBeNull();

  const sharedSchema = param.root.components.setSchema('SharedSchema', { type: 'string' });
  param.setSchema(sharedSchema);
  expect(param.schema).toBe(sharedSchema);
  expect(param.schema?.parent).toBe(param.root.components);
});

describe('examples collection', () => {
  test('querying', () => {
    expect(param.exampleCount).toBe(0);

    const example1 = param.setExample('json');
    const example2 = param.setExample('xml');

    expect(param.exampleCount).toBe(2);
    expect(Array.from(param.exampleKeys())).toStrictEqual(['json', 'xml']);
    expect(Array.from(param.examples())).toStrictEqual([
      ['json', example1],
      ['xml', example2],
    ]);
    expect(param.hasExample('json')).toBe(true);
    expect(param.hasExample('wrong')).toBe(false);
    expect(param.getExample('json')).toBe(example1);
    expect(param.getExample('wrong')).toBeUndefined();
    expect(param.getExampleOrThrow('xml')).toBe(example2);
    expect(() => param.getExampleOrThrow('wrong')).toThrow();
  });

  test('mutation', () => {
    param.setExample('json');
    expect(() => param.setExample('json')).toThrow();

    param.setExample('xml');
    param.setExample('yaml');

    expect(param.exampleCount).toBe(3);
    expect(param.hasExample('xml')).toBe(true);

    param.deleteExample('xml');

    expect(param.exampleCount).toBe(2);
    expect(param.hasExample('xml')).toBe(false);

    param.clearExamples();

    expect(param.exampleCount).toBe(0);
  });

  test('setExampleModel', () => {
    param.setExample('json');

    const sharedExample = param.root.components.setExample('SharedExample') as Example;

    expect(() => param.setExampleModel('json', sharedExample)).toThrow();

    param.setExampleModel('xml', sharedExample);
  });
});

describe('media types collection', () => {
  test('querying', () => {
    expect(param.mediaTypeCount).toBe(0);

    const mediaType1 = param.setMediaType('application/json');
    const mediaType2 = param.setMediaType('application/xml');

    expect(Array.from(param.mediaTypeKeys())).toStrictEqual([
      'application/json',
      'application/xml',
    ]);
    expect(Array.from(param.mediaTypes())).toStrictEqual([
      ['application/json', mediaType1],
      ['application/xml', mediaType2],
    ]);

    expect(param.hasMediaType('application/json')).toBe(true);
    expect(param.hasMediaType('wrong')).toBe(false);

    expect(param.getMediaType('application/json')).toBe(mediaType1);
    expect(param.getMediaType('wrong')).toBeUndefined();
    expect(param.getMediaTypeOrThrow('application/xml')).toBe(mediaType2);
    expect(() => param.getMediaTypeOrThrow('wrong')).toThrow();
  });

  test('mutation', () => {
    param.setMediaType('image/jpeg');
    expect(() => param.setMediaType('image/jpeg')).toThrow();

    param.setMediaType('image/png');
    param.setMediaType('image/gif');

    expect(param.mediaTypeCount).toBe(3);
    expect(param.hasMediaType('image/png')).toBe(true);

    param.deleteMediaType('image/png');

    expect(param.mediaTypeCount).toBe(2);
    expect(param.hasMediaType('image/png')).toBe(false);

    param.clearMediaTypes();

    expect(param.mediaTypeCount).toBe(0);
  });

  test('setMediaTypeModel', () => {
    const anotherParam = param.root.components.setParameter('AnotherParam', 'path', 'x');
    const anotherMediaType = anotherParam.setMediaType('application/json') as MediaType;

    const mediaType = param.setMediaType('application/json');

    expect(() => param.setMediaTypeModel('application/json', anotherMediaType)).toThrow();

    param.setMediaTypeModel('application/xml', mediaType);
    expect(param.getMediaType('application/xml')).toBe(mediaType);
    expect(param.getMediaType('application/json')).toBe(mediaType);
  });
});

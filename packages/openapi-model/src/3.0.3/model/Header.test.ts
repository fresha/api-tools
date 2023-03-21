import { OpenAPIFactory } from './OpenAPI';

let header = OpenAPIFactory.create().components.setHeader('X-Test');

beforeEach(() => {
  header = OpenAPIFactory.create().components.setHeader('X-Test');
});

test('basic properties', () => {
  expect(header).toHaveProperty('description', null);
  expect(header).toHaveProperty('required', false);
  expect(header).toHaveProperty('deprecated', false);
  expect(header).toHaveProperty('style', 'simple');
  expect(header).toHaveProperty('explode', false);
  expect(header).toHaveProperty('schema', null);

  header.description = 'long text';
  header.required = true;
  header.deprecated = true;
  header.style = 'simple';
  header.explode = true;

  expect(header).toHaveProperty('description', 'long text');
  expect(header).toHaveProperty('required', true);
  expect(header).toHaveProperty('deprecated', true);
  expect(header).toHaveProperty('style', 'simple');
  expect(header).toHaveProperty('explode', true);
});

test('schema', () => {
  const schema = header.setSchema('object');

  expect(header.schema).toBe(schema);

  expect(() => header.setSchema('object')).toThrow();

  header.deleteSchema();

  expect(header.schema).toBeNull();
});

describe('example collection', () => {
  test('iterators + getters', () => {
    const ex1 = header.setExample('1');
    const ex2 = header.setExample('2');

    expect(header.exampleCount).toBe(2);
    expect([...header.exampleKeys()]).toStrictEqual(['1', '2']);
    expect([...header.examples()]).toStrictEqual([
      ['1', ex1],
      ['2', ex2],
    ]);
    expect(header.getExample('1')).not.toBeUndefined();
    expect(header.getExample('-')).toBeUndefined();
    expect(header.getExampleOrThrow('2')).not.toBeUndefined();
    expect(() => header.getExampleOrThrow('-')).toThrow();
  });

  test('setExample', () => {
    const example = header.setExample('1');

    expect(header.getExample('1')).toBe(example);
    expect(() => header.setExample('1')).toThrow();
  });

  test('setExampleModel', () => {
    const sharedExample = header.root.components.setExample('SharedExample');

    header.setExampleModel('one', sharedExample);

    expect(header.getExampleOrThrow('one')).toBe(sharedExample);
    expect(() => header.setExampleModel('two', sharedExample)).toThrow();
  });

  test('deleteExample', () => {
    header.setExample('1');
    header.setExample('2');

    header.deleteExample('2');

    expect(Array.from(header.exampleKeys())).toStrictEqual(['1']);
  });

  test('clearExamples', () => {
    header.setExample('1');
    header.setExample('2');
    header.setExample('3');

    header.clearExamples();

    expect(header.exampleCount).toBe(0);
  });
});

describe('media type collection', () => {
  test('iterators', () => {
    const mt1 = header.setMediaType('application/json');
    const mt2 = header.setMediaType('application/xml');

    expect([...header.mediaTypeKeys()]).toStrictEqual(['application/json', 'application/xml']);
    expect([...header.mediaTypes()]).toStrictEqual([
      ['application/json', mt1],
      ['application/xml', mt2],
    ]);
  });

  test('hasMediaType + getMediaType + getMediaTypeOrThrow', () => {
    header.setMediaType('application/json');
    header.setMediaType('application/xml');

    expect(header.hasMediaType('application/json')).toBeTruthy();
    expect(header.hasMediaType('image/jpeg')).toBeFalsy();
    expect(header.getMediaType('application/json')).not.toBeUndefined();
    expect(header.getMediaType('-')).toBeUndefined();
    expect(header.getMediaTypeOrThrow('application/xml')).not.toBeUndefined();
    expect(() => header.getMediaTypeOrThrow('-')).toThrow();
  });

  test('setMediaType', () => {
    const mediaType = header.setMediaType('application/json');

    expect(header.mediaTypeCount).toBe(1);
    expect(header.getMediaType('application/json')).toBe(mediaType);
  });

  test('deleteMediaType', () => {
    header.setMediaType('application/json');
    header.setMediaType('application/xml');

    header.deleteMediaType('application/xml');

    expect(Array.from(header.mediaTypeKeys())).toStrictEqual(['application/json']);
  });

  test('clearMediaTypes', () => {
    header.setMediaType('application/json');
    header.setMediaType('application/xml');
    header.setMediaType('application/vnd.api+json');

    header.clearMediaTypes();

    expect(header.mediaTypeCount).toBe(0);
  });
});

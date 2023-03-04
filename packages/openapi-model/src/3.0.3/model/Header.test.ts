import { OpenAPIFactory } from './OpenAPI';

let header = OpenAPIFactory.create().components.setHeader('X-Test');

beforeEach(() => {
  header = OpenAPIFactory.create().components.setHeader('X-Test');
});

describe('example collection', () => {
  test('getExample + getExampleOrThrow', () => {
    header.setExample('1');
    header.setExample('2');

    expect(header.getExample('1')).not.toBeUndefined();
    expect(header.getExample('-')).toBeUndefined();
    expect(header.getExampleOrThrow('2')).not.toBeUndefined();
    expect(() => header.getExampleOrThrow('-')).toThrow();
  });

  test('setExample', () => {
    const example = header.setExample('1');

    expect(header.exampleCount).toBe(1);
    expect(header.getExample('1')).toBe(example);
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

describe('content collection', () => {
  test('getContent + getContentOrThrow', () => {
    header.setMediaType('application/json');
    header.setMediaType('application/xml');

    expect(header.getMediaType('application/json')).not.toBeUndefined();
    expect(header.getMediaType('-')).toBeUndefined();
    expect(header.getMediaTypeOrThrow('application/xml')).not.toBeUndefined();
    expect(() => header.getMediaTypeOrThrow('-')).toThrow();
  });

  test('setContent', () => {
    const mediaType = header.setMediaType('application/json');

    expect(header.mediaTypeCount).toBe(1);
    expect(header.getMediaType('application/json')).toBe(mediaType);
  });

  test('deleteContent', () => {
    header.setMediaType('application/json');
    header.setMediaType('application/xml');

    header.deleteMediaType('application/xml');

    expect(Array.from(header.mediaTypeKeys())).toStrictEqual(['application/json']);
  });

  test('clearContent', () => {
    header.setMediaType('application/json');
    header.setMediaType('application/xml');
    header.setMediaType('application/vnd.api+json');

    header.clearMediaTypes();

    expect(header.mediaTypeCount).toBe(0);
  });
});

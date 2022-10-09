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

    expect(header.examples.size).toBe(1);
    expect(header.getExample('1')).toBe(example);
  });

  test('deleteExample', () => {
    header.setExample('1');
    header.setExample('2');

    header.deleteExample('2');

    expect(Array.from(header.examples.keys())).toStrictEqual(['1']);
  });

  test('clearExamples', () => {
    header.setExample('1');
    header.setExample('2');
    header.setExample('3');

    header.clearExamples();

    expect(header.examples.size).toBe(0);
  });
});

describe('content collection', () => {
  test('getContent + getContentOrThrow', () => {
    header.setContent('application/json');
    header.setContent('application/xml');

    expect(header.getContent('application/json')).not.toBeUndefined();
    expect(header.getContent('-')).toBeUndefined();
    expect(header.getContentOrThrow('application/xml')).not.toBeUndefined();
    expect(() => header.getContentOrThrow('-')).toThrow();
  });

  test('setContent', () => {
    const mediaType = header.setContent('application/json');

    expect(header.content.size).toBe(1);
    expect(header.getContent('1')).toBe(mediaType);
  });

  test('deleteContent', () => {
    header.setContent('application/json');
    header.setContent('application/xml');

    header.deleteContent('application/xml');

    expect(Array.from(header.content.keys())).toStrictEqual(['application/json']);
  });

  test('clearContent', () => {
    header.setContent('application/json');
    header.setContent('application/xml');
    header.setContent('application/vnd.api+json');

    header.clearContents();

    expect(header.content.size).toBe(0);
  });
});

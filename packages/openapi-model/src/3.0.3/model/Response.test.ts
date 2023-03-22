import { OpenAPIFactory } from './OpenAPI';

import type { ResponseModel } from './types';

let response: ResponseModel = {} as ResponseModel;

beforeEach(() => {
  response = OpenAPIFactory.create().components.setResponse('JSONResponse', 'test');
});

describe('headers collection', () => {
  test('querying', () => {
    response.setHeader('X-Language');
    response.setHeader('X-Fresha');

    expect(response.getHeader('X-Fresha')).not.toBeUndefined();
    expect(response.getHeader('_')).toBeUndefined();
    expect(response.getHeaderOrThrow('X-Language')).not.toBeUndefined();
    expect(() => response.getHeaderOrThrow('?')).toThrow();
  });

  test('mutations', () => {
    response.setHeader('X-Language');
    response.setHeader('X-Fresha');

    expect(() => {
      response.setHeader('X-Language');
    }).toThrow();

    response.deleteHeader('X-Language');
    expect(response.getHeader('X-Language')).toBeUndefined();

    response.clearHeaders();
    expect(response.getHeader('X-Fresha')).toBeUndefined();
  });
});

describe('media type collection', () => {
  test('querying', () => {
    response.setMediaType('application/json');
    response.setMediaType('application/xml');

    expect(response.mediaTypeCount).toBe(2);
    expect([...response.mediaTypeKeys()]).toStrictEqual(['application/json', 'application/xml']);
    expect(response.getMediaType('application/json')).not.toBeUndefined();
    expect(response.getMediaType('-')).toBeUndefined();
    expect(response.getMediaTypeOrThrow('application/xml')).not.toBeUndefined();
    expect(() => response.getMediaTypeOrThrow('-')).toThrow();
  });

  test('mutations', () => {
    response.setMediaType('application/json');
    response.setMediaType('application/xml');

    expect(() => {
      response.setMediaType('application/json');
    }).toThrow();

    response.deleteMediaType('application/json');
    expect(response.mediaTypeCount).toBe(1);

    response.clearMediaTypes();
    expect(response.mediaTypeCount).toBe(0);
  });
});

describe('links collection', () => {
  test('querying', () => {
    expect(response.linkCount).toBe(0);

    const link1 = response.setLink('Language');
    const link2 = response.setLink('Fresha');

    expect(response.linkCount).toBe(2);
    expect([...response.linkKeys()]).toStrictEqual(['Language', 'Fresha']);
    expect([...response.links()]).toStrictEqual([
      ['Language', link1],
      ['Fresha', link2],
    ]);
    expect(response.hasLink('Language')).toBe(true);
    expect(response.hasLink('_')).toBe(false);
    expect(response.getLink('Language')).toBe(link1);
    expect(response.getLink('_')).toBeUndefined();
    expect(response.getLinkOrThrow('Fresha')).toBe(link2);
    expect(() => response.getLinkOrThrow('?')).toThrow();
  });

  test('mutations', () => {
    response.setLink('Language');
    response.setLink('Fresha');

    expect(() => {
      response.setLink('Language');
    }).toThrow();

    const sharedLink = response.root.components.setLink('SharedLink');
    expect(() => {
      response.setLinkModel('Fresha', sharedLink);
    }).toThrow();
    response.setLinkModel('Shared', sharedLink);

    response.deleteLink('Language');
    expect(response.linkCount).toBe(2);

    response.clearLinks();
    expect(response.linkCount).toBe(0);
  });
});

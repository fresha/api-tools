import { OpenAPIFactory } from './OpenAPI';

import type { ResponseModel } from './types';

let response: ResponseModel = {} as ResponseModel;

beforeEach(() => {
  response = OpenAPIFactory.create().components.setResponse('JSONResponse', 'test');
});

describe('headers collection', () => {
  test('getHeader + getHeaderOrThrow', () => {
    response.setHeader('X-Language');
    response.setHeader('X-Fresha');

    expect(response.getHeader('X-Fresha')).not.toBeUndefined();
    expect(response.getHeader('_')).toBeUndefined();
    expect(response.getHeaderOrThrow('X-Language')).not.toBeUndefined();
    expect(() => response.getHeaderOrThrow('?')).toThrow();
  });
});

describe('content collection', () => {
  test('getContent + getContentOrThrow', () => {
    response.setContent('application/json');
    response.setContent('application/xml');

    expect(response.getContent('application/json')).not.toBeUndefined();
    expect(response.getContent('-')).toBeUndefined();
    expect(response.getContentOrThrow('application/xml')).not.toBeUndefined();
    expect(() => response.getContentOrThrow('-')).toThrow();
  });
});

describe('links collection', () => {
  test('getLink + getLinkOrThrow', () => {
    response.setLink('Language');
    response.setLink('Fresha');

    expect(response.getLink('Language')).not.toBeUndefined();
    expect(response.getLink('_')).toBeUndefined();
    expect(response.getLinkOrThrow('Fresha')).not.toBeUndefined();
    expect(() => response.getLinkOrThrow('?')).toThrow();
  });
});

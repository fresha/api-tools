import { OpenAPIFactory } from './OpenAPI';

import type { RequestBodyModel } from './types';

let requestBody: RequestBodyModel = {} as RequestBodyModel;

beforeEach(() => {
  requestBody = OpenAPIFactory.create().components.setRequestBody('JSONRequest');
});

describe('content collections', () => {
  test('getContent + getContentOrThrow', () => {
    requestBody.setContent('application/json');
    requestBody.setContent('application/xml');
    requestBody.setContent('image/png');

    expect(requestBody.getContent('image/png')).not.toBeUndefined();
    expect(requestBody.getContent('app/x')).toBeUndefined();
    expect(requestBody.getContentOrThrow('application/json')).not.toBeUndefined();
    expect(() => requestBody.getContentOrThrow('image/x')).toThrow();
  });

  test('mutation methods', () => {
    requestBody.setContent('application/json');
    requestBody.setContent('application/xml');
    requestBody.setContent('image/png');

    expect(requestBody.content.size).toBe(3);

    requestBody.deleteContent('image/png');

    expect(requestBody.content.size).toBe(2);
    expect(requestBody.getContent('image/png')).toBeUndefined();

    requestBody.clearContent();

    expect(requestBody.content.size).toBe(0);
  });
});

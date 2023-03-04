import { OpenAPIFactory } from './OpenAPI';

import type { RequestBodyModel } from './types';

let requestBody: RequestBodyModel = {} as RequestBodyModel;

beforeEach(() => {
  requestBody = OpenAPIFactory.create().components.setRequestBody('JSONRequest');
});

describe('content collections', () => {
  test('getContent + getContentOrThrow', () => {
    requestBody.setMediaType('application/json');
    requestBody.setMediaType('application/xml');
    requestBody.setMediaType('image/png');

    expect(requestBody.getMediaType('image/png')).not.toBeUndefined();
    expect(requestBody.getMediaType('app/x')).toBeUndefined();
    expect(requestBody.getMediaTypeOrThrow('application/json')).not.toBeUndefined();
    expect(() => requestBody.getMediaTypeOrThrow('image/x')).toThrow();
  });

  test('mutation methods', () => {
    requestBody.setMediaType('application/json');
    requestBody.setMediaType('application/xml');
    requestBody.setMediaType('image/png');

    expect(requestBody.mediaTypeCount).toBe(3);

    requestBody.deleteMediaType('image/png');

    expect(requestBody.mediaTypeCount).toBe(2);
    expect(requestBody.getMediaType('image/png')).toBeUndefined();

    requestBody.clearMediaTypes();

    expect(requestBody.mediaTypeCount).toBe(0);
  });
});

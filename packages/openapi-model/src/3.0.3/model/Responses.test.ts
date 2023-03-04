import { OpenAPIFactory } from './OpenAPI';

import type { ResponsesModel } from './types';

let responses: ResponsesModel = {} as ResponsesModel;

beforeEach(() => {
  responses = OpenAPIFactory.create().setPathItem('/item').addOperation('get').responses;
});

describe('responses collection', () => {
  test('getResponse + getResponseOrThrow', () => {
    responses.setResponse(200, 'success');
    responses.setResponse(201, 'created');

    expect(responses.getResponse(200)).not.toBeUndefined();
    expect(responses.getResponse(500)).toBeUndefined();
    expect(responses.getResponseOrThrow(201)).not.toBeUndefined();
    expect(() => responses.getResponseOrThrow(404)).toThrow();
  });
});

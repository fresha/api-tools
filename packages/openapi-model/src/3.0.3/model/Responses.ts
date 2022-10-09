import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Response } from './Response';

import type { HTTPStatusCode, ResponseModel, ResponsesModel, ResponsesModelParent } from './types';
import type { CommonMarkString, Nullable } from '@fresha/api-tools-core';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#responses-object
 */
export class Responses extends BasicNode<ResponsesModelParent> implements ResponsesModel {
  default: Nullable<ResponseModel>;
  codes: Map<HTTPStatusCode, ResponseModel>;

  constructor(parent: ResponsesModelParent) {
    super(parent);
    this.default = null;
    this.codes = new Map<HTTPStatusCode, ResponseModel>();
  }

  setDefaultResponse(description: string): ResponseModel {
    const response = new Response(this, description);
    this.default = response;
    return response;
  }

  deleteDefaultResponse(): void {
    this.default = null;
  }

  getResponse(code: HTTPStatusCode): ResponseModel | undefined {
    return this.codes.get(code);
  }

  getResponseOrThrow(code: HTTPStatusCode): ResponseModel {
    const result = this.getResponse(code);
    assert(result);
    return result;
  }

  setResponse(code: HTTPStatusCode, description: CommonMarkString): ResponseModel {
    assert(!this.codes.has(code), `Duplicate response for code ${code}`);
    const response = new Response(this, description);
    this.codes.set(code, response);
    return response;
  }

  deleteResponse(code: HTTPStatusCode): void {
    this.codes.delete(code);
  }

  clearResponses(): void {
    this.codes.clear();
  }
}

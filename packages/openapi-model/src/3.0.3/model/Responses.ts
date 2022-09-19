import { BasicNode } from './BasicNode';
import { Response } from './Response';

import type { Operation } from './Operation';
import type { HTTPStatusCode, ResponseModel, ResponsesModel } from './types';
import type { CommonMarkString, Nullable } from '@fresha/api-tools-core';

export type ResponsesParent = Operation;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#responses-object
 */
export class Responses extends BasicNode<ResponsesParent> implements ResponsesModel {
  default: Nullable<Response>;
  codes: Map<HTTPStatusCode, Response>;

  constructor(parent: ResponsesParent) {
    super(parent);
    this.default = null; // new Response(this, 'Default');
    this.codes = new Map<HTTPStatusCode, Response>();
  }

  setDefaultResponse(description: string): ResponseModel {
    const response = new Response(this, description);
    this.default = response;
    return response;
  }

  deleteDefaultResponse(): void {
    this.default = null;
  }

  setResponse(code: HTTPStatusCode, description: CommonMarkString): ResponseModel {
    if (this.codes.has(code)) {
      throw new Error(`Duplicate response for code ${code}`);
    }
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

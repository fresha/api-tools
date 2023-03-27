import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Response } from './Response';

import type { HTTPStatusCode, ResponsesModel, ResponsesModelParent } from './types';
import type { CommonMarkString, Nullable } from '@fresha/api-tools-core';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#responses-object
 */
export class Responses extends BasicNode<ResponsesModelParent> implements ResponsesModel {
  #default: Nullable<Response>;
  #codes: Map<HTTPStatusCode, Response>;

  constructor(parent: ResponsesModelParent) {
    super(parent);
    this.#default = null;
    this.#codes = new Map<HTTPStatusCode, Response>();
  }

  get default(): Nullable<Response> {
    return this.#default;
  }

  setDefaultResponse(description: string): Response {
    assert(!this.#default, 'Default response is already set');
    this.#default = new Response(this, description);
    return this.#default;
  }

  setDefaultResponseModel(model: Response): void {
    assert(!this.#default, 'Default response is already set');
    this.#default = model;
  }

  deleteDefaultResponse(): void {
    if (this.#default) {
      this.#default.dispose();
      this.#default = null;
    }
  }

  get responseCount(): number {
    return this.#codes.size;
  }

  responseCodes(): IterableIterator<HTTPStatusCode> {
    return this.#codes.keys();
  }

  responses(): IterableIterator<[HTTPStatusCode, Response]> {
    return this.#codes.entries();
  }

  hasResponse(code: HTTPStatusCode): boolean {
    return this.#codes.has(code);
  }

  getResponse(code: HTTPStatusCode): Response | undefined {
    return this.#codes.get(code);
  }

  getResponseOrThrow(code: HTTPStatusCode): Response {
    const result = this.getResponse(code);
    assert(result, `Response '${code}' was missing`);
    return result;
  }

  setResponse(code: HTTPStatusCode, description: CommonMarkString): Response {
    assert(!this.#codes.has(code), `Duplicate response for code ${code}`);
    const response = new Response(this, description);
    this.#codes.set(code, response);
    return response;
  }

  setResponseModel(code: HTTPStatusCode, model: Response): void {
    assert(!this.#codes.has(code), `Duplicate response for code ${code}`);
    // assert(
    //   !Array.from(this.#codes.values()).includes(model),
    //   `The response you want to add under '${code}' code already exists under another code`,
    // );
    this.#codes.set(code, model);
  }

  deleteResponse(code: HTTPStatusCode): void {
    this.#codes.delete(code);
  }

  clearResponses(): void {
    this.#codes.clear();
  }
}

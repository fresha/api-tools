import assert from 'assert';

import { Node } from './Node';
import { Response } from './Response';

import type { Operation } from './Operation';
import type { ResponsesModel } from './types';
import type { CommonMarkString, HTTPStatusCode, Nullable } from '@fresha/api-tools-core';

type ResponsesParent = Operation;

export class Responses extends Node<ResponsesParent> implements ResponsesModel {
  #defaultResponse: Nullable<Response>;
  readonly #codes: Map<HTTPStatusCode, Response>;

  constructor(parent: ResponsesParent) {
    super(parent);
    this.#defaultResponse = null;
    this.#codes = new Map<HTTPStatusCode, Response>();
  }

  get defaultResponse(): Nullable<Response> {
    return this.#defaultResponse;
  }

  addDefaultResponse(description: CommonMarkString): Response {
    assert(!this.#defaultResponse, 'Default response is already set');
    const result = new Response(this, description);
    this.#defaultResponse = result;
    return result;
  }

  deleteDefaultResponse(): void {
    if (this.#defaultResponse) {
      this.#defaultResponse.dispose();
      this.#defaultResponse = null;
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

  getResponse(code: HTTPStatusCode): Response {
    const result = this.#codes.get(code);
    assert(result, `Response for HTTP code ${code} is missing`);
    return result;
  }

  addResponse(code: HTTPStatusCode, description: CommonMarkString): Response {
    assert(!this.hasResponse(code), `Response for code ${code} is already set`);
    const result = new Response(this, description);
    this.#codes.set(code, result);
    return result;
  }

  deleteResponse(code: HTTPStatusCode): void {
    const response = this.#codes.get(code);
    if (response) {
      response.dispose();
      this.#codes.delete(code);
    }
  }

  clearResponses(): void {
    this.#codes.forEach(r => r.dispose());
    this.#codes.clear();
  }
}

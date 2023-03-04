import assert from 'assert';

import { BasicNode } from './BasicNode';

import type { Server } from './Server';
import type { LinkModel, LinkModelParent } from './types';
import type { Nullable, JSONValue, CommonMarkString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#link-object
 */
export class Link extends BasicNode<LinkModelParent> implements LinkModel {
  #operationRef: Nullable<string>;
  #operationId: Nullable<string>;
  readonly #parameters: Map<string, JSONValue>;
  #requestBody: JSONValue;
  #description: Nullable<string>;
  #server: Nullable<Server>;

  constructor(parent: LinkModelParent) {
    super(parent);
    this.#operationRef = null;
    this.#operationId = null;
    this.#parameters = new Map<string, JSONValue>();
    this.#requestBody = null;
    this.#description = null;
    this.#server = null;
  }

  get operationRef(): Nullable<string> {
    return this.#operationRef;
  }

  set operationRef(value: Nullable<string>) {
    this.#operationRef = value;
  }

  get operationId(): Nullable<string> {
    return this.#operationId;
  }

  set operationId(value: Nullable<string>) {
    this.#operationId = value;
  }

  get requestBody(): JSONValue {
    return this.#requestBody;
  }

  set requestBody(value: JSONValue) {
    this.#requestBody = value;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }

  get server(): Nullable<Server> {
    return this.#server;
  }

  set server(value: Nullable<Server>) {
    this.#server = value;
  }

  get parameterCount(): number {
    return this.#parameters.size;
  }

  parameterNames(): IterableIterator<string> {
    return this.#parameters.keys();
  }

  parameters(): IterableIterator<[string, JSONValue]> {
    return this.#parameters.entries();
  }

  hasParameter(key: string): boolean {
    return this.#parameters.has(key);
  }

  getParameter(key: string): JSONValue | undefined {
    return this.#parameters.get(key);
  }

  getParameterOrThrow(key: string): JSONValue {
    const result = this.getParameter(key);
    assert(result !== undefined);
    return result;
  }

  setParameter(key: string, value: JSONValue): void {
    this.#parameters.set(key, value);
  }

  deleteParameter(key: string): void {
    this.#parameters.delete(key);
  }

  clearParameters(): void {
    this.#parameters.clear();
  }
}

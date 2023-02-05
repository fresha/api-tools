import assert from 'assert';

import { CommonMarkString, JSONValue, Nullable } from '@fresha/api-tools-core';

import { Node } from './Node';
import { Operation } from './Operation';
import { Server } from './Server';

import type { Components } from './Components';
import type { Response } from './Response';
import type { LinkModel } from './types';

type LinkParent = Components | Response;

export class Link extends Node<LinkParent> implements LinkModel {
  #operation: Nullable<Operation>;
  readonly #parameters: Map<string, JSONValue>;
  #requestBody: JSONValue;
  #description: Nullable<CommonMarkString>;
  #server: Nullable<Server>;

  constructor(parent: LinkParent) {
    super(parent);
    this.#operation = null;
    this.#parameters = new Map<string, JSONValue>();
    this.#requestBody = null;
    this.#description = null;
    this.#server = null;
  }

  get operation(): Nullable<Operation> {
    return this.#operation;
  }

  set operation(value: Nullable<Operation>) {
    this.#operation = value;
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

  hasParameter(name: string): boolean {
    return this.#parameters.has(name);
  }

  getParameterValue(name: string): JSONValue {
    const result = this.#parameters.get(name);
    assert(result !== undefined, `Missing value for parameter '${name}'`);
    return result;
  }

  setParameterValue(name: string, value: JSONValue): void {
    this.#parameters.set(name, value);
  }

  deleteParameter(name: string): void {
    this.#parameters.delete(name);
  }

  clearParameter(): void {
    this.#parameters.clear();
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
}

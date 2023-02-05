import { Nullable } from '@fresha/api-tools-core';

import { Node } from './Node';

import type { Schema } from './Schema';
import type { XMLModel } from './types';

export type XMLParent = Schema;

export class XML extends Node<XMLParent> implements XMLModel {
  #name: Nullable<string>;
  #namespace: Nullable<string>;
  #prefix: Nullable<string>;
  #attribute: boolean;
  #wrapped: boolean;

  constructor(parent: XMLParent) {
    super(parent);
    this.#name = null;
    this.#namespace = null;
    this.#prefix = null;
    this.#attribute = false;
    this.#wrapped = false;
  }

  get name(): Nullable<string> {
    return this.#name;
  }

  set name(value: Nullable<string>) {
    this.#name = value;
  }

  get namespace(): Nullable<string> {
    return this.#namespace;
  }

  set namespace(value: Nullable<string>) {
    this.#namespace = value;
  }

  get prefix(): Nullable<string> {
    return this.#prefix;
  }

  set prefix(value: Nullable<string>) {
    this.#prefix = value;
  }

  get attribute(): boolean {
    return this.#attribute;
  }

  set attribute(value: boolean) {
    this.#attribute = value;
  }

  get wrapped(): boolean {
    return this.#wrapped;
  }

  set wrapped(value: boolean) {
    this.#wrapped = value;
  }
}

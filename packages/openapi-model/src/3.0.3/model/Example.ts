import assert from 'assert';

import isURL from 'validator/lib/isURL';

import { BasicNode } from './BasicNode';

import type { ExampleModel, ExampleModelParent } from './types';
import type { Nullable, URLString, JSONValue, CommonMarkString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#example-object
 */
export class Example extends BasicNode<ExampleModelParent> implements ExampleModel {
  #summary: Nullable<string>;
  #description: Nullable<CommonMarkString>;
  #value: JSONValue;
  #externalValue: Nullable<URLString>;

  constructor(parent: ExampleModelParent) {
    super(parent);
    this.#summary = null;
    this.#description = null;
    this.#value = null;
    this.#externalValue = null;
  }

  get summary(): Nullable<string> {
    return this.#summary;
  }

  set summary(value: Nullable<string>) {
    this.#summary = value;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }

  get value(): JSONValue {
    return this.#value;
  }

  set value(value: JSONValue) {
    this.#value = value;
  }

  get externalValue(): Nullable<URLString> {
    return this.#externalValue;
  }

  set externalValue(value: Nullable<URLString>) {
    assert(value == null || isURL(value), `External value is not a valid URL '${String(value)}'`);
    this.#externalValue = value;
  }
}

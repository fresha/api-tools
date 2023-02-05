import { Node } from './Node';

import type { Components } from './Components';
import type { Header } from './Header';
import type { MediaType } from './MediaType';
import type { ParameterBase } from './Parameter';
import type { ExampleModel } from './types';
import type { Nullable, JSONValue, CommonMarkString, URLString } from '@fresha/api-tools-core';

type ExampleParent = Components | ParameterBase | Header | MediaType;

export class Example extends Node<ExampleParent> implements ExampleModel {
  #summary: Nullable<string>;
  #description: Nullable<CommonMarkString>;
  #value: JSONValue;
  #externalValue: Nullable<URLString>;

  constructor(parent: ExampleParent) {
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
    this.#externalValue = value;
  }
}

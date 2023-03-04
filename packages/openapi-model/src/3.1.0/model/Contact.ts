import { Info } from './Info';
import { Node } from './Node';

import type { ContactModel } from './types';
import type { Nullable, URLString } from '@fresha/api-tools-core';

export class Contact extends Node<Info> implements ContactModel {
  #name: Nullable<string>;
  #url: Nullable<URLString>;
  #email: Nullable<string>;

  constructor(parent: Info) {
    super(parent);
    this.#name = null;
    this.#url = null;
    this.#email = null;
  }

  get name(): Nullable<string> {
    return this.#name;
  }

  set name(value: Nullable<string>) {
    this.#name = value;
  }

  get url(): Nullable<URLString> {
    return this.#url;
  }

  set url(value: Nullable<URLString>) {
    this.#url = value;
  }

  get email(): Nullable<string> {
    return this.#email;
  }

  set email(value: Nullable<string>) {
    this.#email = value;
  }
}

import { Info } from './Info';
import { Node } from './Node';

import type { ContactModel } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export class Contact extends Node<Info> implements ContactModel {
  #name: Nullable<string>;
  #url: Nullable<string>;
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

  get url(): Nullable<string> {
    return this.#url;
  }

  get email(): Nullable<string> {
    return this.#email;
  }
}

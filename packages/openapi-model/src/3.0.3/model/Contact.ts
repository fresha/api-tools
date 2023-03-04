import { BasicNode } from './BasicNode';

import type { ContactModel, ContactModelParent } from './types';
import type { Nullable, URLString, EmailString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#contact-object
 */
export class Contact extends BasicNode<ContactModelParent> implements ContactModel {
  #name: Nullable<string>;
  #url: Nullable<URLString>;
  #email: Nullable<EmailString>;

  constructor(parent: ContactModelParent) {
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

  get email(): Nullable<EmailString> {
    return this.#email;
  }

  set email(value: Nullable<EmailString>) {
    this.#email = value;
  }
}

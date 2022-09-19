import { BasicNode } from './BasicNode';

import type { Info } from './Info';
import type { ContactModel } from './types';
import type { Nullable, URLString, EmailString } from '@fresha/api-tools-core';

export type ContactParent = Info;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#contact-object
 */
export class Contact extends BasicNode<ContactParent> implements ContactModel {
  name: Nullable<string>;
  url: Nullable<URLString>;
  email: Nullable<EmailString>;

  constructor(parent: ContactParent) {
    super(parent);
    this.name = null;
    this.url = null;
    this.email = null;
  }
}

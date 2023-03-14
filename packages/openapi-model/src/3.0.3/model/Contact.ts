import { BasicNode } from './BasicNode';

import type { ContactModel, ContactModelParent, TreeNode } from './types';
import type { Nullable, URLString, EmailString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#contact-object
 */
export class Contact extends BasicNode<ContactModelParent> implements ContactModel {
  name: Nullable<string>;
  url: Nullable<URLString>;
  email: Nullable<EmailString>;

  constructor(parent: ContactModelParent) {
    super(parent);
    this.name = null;
    this.url = null;
    this.email = null;
  }

  // eslint-disable-next-line class-methods-use-this
  *children(): IterableIterator<TreeNode<unknown>> {
  }
}

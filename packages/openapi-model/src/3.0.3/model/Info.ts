import { BasicNode } from './BasicNode';
import { Contact } from './Contact';
import { License } from './License';

import type { InfoModel, InfoModelParent } from './types';
import type { CommonMarkString, Nullable, URLString, VersionString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#info-object
 */
export class Info extends BasicNode<InfoModelParent> implements InfoModel {
  title: string;
  description: Nullable<CommonMarkString>;
  termsOfService: Nullable<URLString>;
  readonly contact: Contact;
  readonly license: License;
  version: VersionString;

  constructor(parent: InfoModelParent, title: string, version: VersionString) {
    super(parent);
    this.title = title;
    this.description = null;
    this.termsOfService = null;
    this.contact = new Contact(this);
    this.license = new License(this, 'UNLICENSED');
    this.version = version;
  }
}

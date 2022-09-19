import { BasicNode } from './BasicNode';
import { Contact } from './Contact';
import { License } from './License';

import type { OpenAPI } from './OpenAPI';
import type { InfoModel } from './types';
import type { CommonMarkString, Nullable, URLString, VersionString } from '@fresha/api-tools-core';

export type InfoParent = OpenAPI;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#info-object
 */
export class Info extends BasicNode<InfoParent> implements InfoModel {
  title: string;
  description: Nullable<CommonMarkString>;
  termsOfService: Nullable<URLString>;
  readonly contact: Contact;
  readonly license: License;
  version: VersionString;

  constructor(parent: InfoParent, title: string, version: VersionString) {
    super(parent);
    this.title = title;
    this.description = null;
    this.termsOfService = null;
    this.contact = new Contact(this);
    this.license = new License(this, 'UNLICENSED');
    this.version = version;
  }
}

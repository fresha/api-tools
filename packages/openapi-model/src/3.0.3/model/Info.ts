import { BasicNode } from './BasicNode';
import { Contact } from './Contact';
import { License } from './License';

import type { InfoModel, InfoModelParent } from './types';
import type { CommonMarkString, Nullable, URLString, VersionString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#info-object
 */
export class Info extends BasicNode<InfoModelParent> implements InfoModel {
  #title: string;
  #description: Nullable<CommonMarkString>;
  #termsOfService: Nullable<URLString>;
  readonly #contact: Contact;
  readonly #license: License;
  #version: VersionString;

  constructor(parent: InfoModelParent, title: string, version: VersionString) {
    super(parent);
    this.#title = title;
    this.#description = null;
    this.#termsOfService = null;
    this.#contact = new Contact(this);
    this.#license = new License(this, 'UNLICENSED');
    this.#version = version;
  }

  get title(): string {
    return this.#title;
  }

  set title(value: string) {
    this.#title = value;
  }

  get description(): Nullable<string> {
    return this.#description;
  }

  set description(value: Nullable<string>) {
    this.#description = value;
  }

  get termsOfService(): Nullable<URLString> {
    return this.#termsOfService;
  }

  set termsOfService(value: Nullable<URLString>) {
    this.#termsOfService = value;
  }

  get contact(): Contact {
    return this.#contact;
  }

  get license(): License {
    return this.#license;
  }

  get version(): VersionString {
    return this.#version;
  }

  set version(value: VersionString) {
    this.#version = value;
  }
}

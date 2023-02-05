import { Contact } from './Contact';
import { License } from './License';
import { Node } from './Node';
import { OpenAPI } from './OpenAPI';

import type { InfoModel } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export class Info extends Node<OpenAPI> implements InfoModel {
  #title: string;
  #description: Nullable<string>;
  #termsOfService: Nullable<string>;
  readonly #contact: Contact;
  readonly #license: License;
  #version: string;

  constructor(parent: OpenAPI, title: string, version: string) {
    super(parent);
    this.#title = title;
    this.#description = null;
    this.#termsOfService = null;
    this.#contact = new Contact(this);
    this.#license = new License(this);
    this.#version = version;
  }

  get title(): string {
    return this.#title;
  }

  get description(): Nullable<string> {
    return this.#description;
  }

  get termsOfService(): Nullable<string> {
    return this.#termsOfService;
  }

  get contact(): Contact {
    return this.#contact;
  }

  get license(): License {
    return this.#license;
  }

  get version(): string {
    return this.#version;
  }
}

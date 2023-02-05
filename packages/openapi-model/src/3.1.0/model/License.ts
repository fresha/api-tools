import { Info } from './Info';
import { Node } from './Node';

import type { LicenseModel } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export class License extends Node<Info> implements LicenseModel {
  #name: string;
  #url: Nullable<string>;

  constructor(parent: Info) {
    super(parent);
    this.#name = '';
    this.#url = null;
  }

  get name(): string {
    return this.#name;
  }

  get url(): Nullable<string> {
    return this.#url;
  }
}

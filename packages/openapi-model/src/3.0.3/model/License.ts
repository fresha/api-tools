import { BasicNode } from './BasicNode';

import type { LicenseModel, LicenseModelParent } from './types';
import type { Nullable, URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#license-object
 */
export class License extends BasicNode<LicenseModelParent> implements LicenseModel {
  #name: string;
  #url: Nullable<URLString>;

  constructor(parent: LicenseModelParent, name: string) {
    super(parent);
    this.#name = name;
    this.#url = null;
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    this.#name = value;
  }

  get url(): Nullable<URLString> {
    return this.#url;
  }

  set url(value: Nullable<URLString>) {
    this.#url = value;
  }
}

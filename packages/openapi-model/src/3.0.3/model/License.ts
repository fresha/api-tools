import { BasicNode } from './BasicNode';

import type { Info } from './Info';
import type { LicenseModel } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export type LicenseParent = Info;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#license-object
 */
export class License extends BasicNode<LicenseParent> implements LicenseModel {
  name: string;
  url: Nullable<string>;

  constructor(parent: LicenseParent, name: string) {
    super(parent);
    this.name = name;
    this.url = null;
  }
}

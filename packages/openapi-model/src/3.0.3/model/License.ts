import { BasicNode } from './BasicNode';

import type { LicenseModel, LicenseModelParent } from './types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#license-object
 */
export class License extends BasicNode<LicenseModelParent> implements LicenseModel {
  name: string;
  url: Nullable<string>;

  constructor(parent: LicenseModelParent, name: string) {
    super(parent);
    this.name = name;
    this.url = null;
  }
}

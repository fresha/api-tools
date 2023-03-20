import { BasicNode } from '../BasicNode';

import type { SecuritySchemaModelParent, SecuritySchemeType } from '../types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export abstract class SecuritySchemeBase<
  T extends SecuritySchemeType,
> extends BasicNode<SecuritySchemaModelParent> {
  readonly #type: T;
  #description: Nullable<string>;

  constructor(parent: SecuritySchemaModelParent, type: T) {
    super(parent);
    this.#type = type;
    this.#description = null;
  }

  get type(): T {
    return this.#type;
  }

  get description(): Nullable<string> {
    return this.#description;
  }

  set description(value: Nullable<string>) {
    this.#description = value;
  }
}

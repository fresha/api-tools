import { Node } from '../Node';

import type { Components } from '../Components';
import type { SecuritySchemaModelBase } from '../types';
import type { CommonMarkString, Nullable } from '@fresha/api-tools-core';

export type SecuritySchemaParent = Components;

export class SecuritySchemaBase
  extends Node<SecuritySchemaParent>
  implements SecuritySchemaModelBase
{
  #description: Nullable<CommonMarkString>;

  constructor(parent: SecuritySchemaParent) {
    super(parent);
    this.#description = null;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }
}

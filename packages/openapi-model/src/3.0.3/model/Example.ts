import { BasicNode } from './BasicNode';

import type { Components } from './Components';
import type { Header } from './Header';
import type { MediaType } from './MediaType';
import type { Parameter } from './Parameter';
import type { ExampleModel } from './types';
import type { Nullable, URLString, JSONValue } from '@fresha/api-tools-core';

export type ExampleParent = Components | MediaType | Parameter | Header;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#example-object
 */
export class Example extends BasicNode<ExampleParent> implements ExampleModel {
  summary: Nullable<string>;
  description: Nullable<string>;
  value: JSONValue;
  externalValue: Nullable<URLString>;

  constructor(parent: ExampleParent) {
    super(parent);
    this.summary = null;
    this.description = null;
    this.value = null;
    this.externalValue = null;
  }
}

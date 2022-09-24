import { BasicNode } from './BasicNode';

import type { ExampleModel, ExampleModelParent } from './types';
import type { Nullable, URLString, JSONValue } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#example-object
 */
export class Example extends BasicNode<ExampleModelParent> implements ExampleModel {
  summary: Nullable<string>;
  description: Nullable<string>;
  value: JSONValue;
  externalValue: Nullable<URLString>;

  constructor(parent: ExampleModelParent) {
    super(parent);
    this.summary = null;
    this.description = null;
    this.value = null;
    this.externalValue = null;
  }
}

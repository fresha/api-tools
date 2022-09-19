import { BasicNode } from './BasicNode';

import type { Schema } from './Schema';
import type { DiscriminatorModel } from './types';

export type DiscriminatorParent = Schema;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#discriminator-object
 */
export class Discriminator extends BasicNode<DiscriminatorParent> implements DiscriminatorModel {
  propertyName: string;
  readonly mapping: Map<string, string>;

  constructor(parent: Schema, propertyName: string) {
    super(parent);
    this.propertyName = propertyName;
    this.mapping = new Map<string, string>();
  }
}

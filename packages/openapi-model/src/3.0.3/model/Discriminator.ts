import { BasicNode } from './BasicNode';

import type { DiscriminatorModel, DiscriminatorModelParent } from './types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#discriminator-object
 */
export class Discriminator
  extends BasicNode<DiscriminatorModelParent>
  implements DiscriminatorModel
{
  propertyName: string;
  readonly mapping: Map<string, string>;

  constructor(parent: DiscriminatorModelParent, propertyName: string) {
    super(parent);
    this.propertyName = propertyName;
    this.mapping = new Map<string, string>();
  }
}

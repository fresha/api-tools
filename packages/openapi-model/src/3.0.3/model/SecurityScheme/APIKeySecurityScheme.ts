import { SecuritySchemeBase } from './SecuritySchemeBase';

import type { APIKeySecuritySchemaModel, SecuritySchemaModelParent, TreeNode } from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export class APIKeySecurityScheme extends SecuritySchemeBase implements APIKeySecuritySchemaModel {
  declare readonly type: 'apiKey';
  name: string;
  in: 'query' | 'header' | 'cookie';

  constructor(
    parent: SecuritySchemaModelParent,
    name: string,
    location: 'query' | 'header' | 'cookie',
  ) {
    super(parent, 'apiKey');
    this.name = name;
    this.in = location;
  }

  // eslint-disable-next-line class-methods-use-this
  *children(): IterableIterator<TreeNode<unknown>> {

  }
}

import { BasicNode } from './BasicNode';

import type { OpenAPI } from './OpenAPI';
import type { Operation } from './Operation';
import type { Schema } from './Schema';
import type { Tag } from './Tag';
import type { ExternalDocumentationModel } from './types';
import type { CommonMarkString, Nullable, URLString } from '@fresha/api-tools-core';

export type ExternalDocumentationParent = OpenAPI | Operation | Schema | Tag;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#external-documentation-object
 */
export class ExternalDocumentation
  extends BasicNode<ExternalDocumentationParent>
  implements ExternalDocumentationModel
{
  url: URLString;
  description: Nullable<CommonMarkString>;

  constructor(parent: ExternalDocumentationParent, url: URLString) {
    super(parent);
    this.url = url;
    this.description = null;
  }
}

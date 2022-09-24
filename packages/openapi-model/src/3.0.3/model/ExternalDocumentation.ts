import { BasicNode } from './BasicNode';

import type { ExternalDocumentationModel, ExternalDocumentationModelParent } from './types';
import type { CommonMarkString, Nullable, URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#external-documentation-object
 */
export class ExternalDocumentation
  extends BasicNode<ExternalDocumentationModelParent>
  implements ExternalDocumentationModel
{
  url: URLString;
  description: Nullable<CommonMarkString>;

  constructor(parent: ExternalDocumentationModelParent, url: URLString) {
    super(parent);
    this.url = url;
    this.description = null;
  }
}

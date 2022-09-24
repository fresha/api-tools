import { CommonMarkString, Nullable } from '@fresha/api-tools-core';

import { BasicNode } from './BasicNode';

import type { ExternalDocumentationModel, TagModel, TagModelParent } from './types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#tag-object
 */
export class Tag extends BasicNode<TagModelParent> implements TagModel {
  name: string;
  description: Nullable<CommonMarkString>;
  externalDocs: Nullable<ExternalDocumentationModel>;

  constructor(parent: TagModelParent, name: string) {
    super(parent);
    this.name = name;
    this.description = null;
    this.externalDocs = null;
  }
}

import { CommonMarkString, Nullable } from '@fresha/api-tools-core';

import { BasicNode } from './BasicNode';

import type { ExternalDocumentation } from './ExternalDocumentation';
import type { OpenAPI } from './OpenAPI';
import type { TagModel } from './types';

export type TagParent = OpenAPI;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#tag-object
 */
export class Tag extends BasicNode<TagParent> implements TagModel {
  name: string;
  description: Nullable<CommonMarkString>;
  externalDocs: Nullable<ExternalDocumentation>;

  constructor(parent: TagParent, name: string) {
    super(parent);
    this.name = name;
    this.description = null;
    this.externalDocs = null;
  }
}

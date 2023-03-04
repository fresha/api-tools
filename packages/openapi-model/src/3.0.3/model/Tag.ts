import assert from 'assert';

import { BasicNode } from './BasicNode';
import { ExternalDocumentation } from './ExternalDocumentation';

import type { TagModel, TagModelParent } from './types';
import type { CommonMarkString, Nullable, URLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#tag-object
 */
export class Tag extends BasicNode<TagModelParent> implements TagModel {
  #name: string;
  #description: Nullable<CommonMarkString>;
  #externalDocs: Nullable<ExternalDocumentation>;

  constructor(parent: TagModelParent, name: string) {
    super(parent);
    this.#name = name;
    this.#description = null;
    this.#externalDocs = null;
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    assert(value, 'Tag name cannot be empty');
    this.#name = value;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }

  get externalDocs(): Nullable<ExternalDocumentation> {
    return this.#externalDocs;
  }

  addExternalDocs(url: URLString): ExternalDocumentation {
    assert(!this.#externalDocs, 'External documentation is already set');
    this.#externalDocs = new ExternalDocumentation(this, url);
    return this.#externalDocs;
  }

  deleteExternalDocs(): void {
    this.#externalDocs?.dispose();
    this.#externalDocs = null;
  }
}

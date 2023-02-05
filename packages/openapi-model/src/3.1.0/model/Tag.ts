import assert from 'assert';

import { ExternalDocumentation } from './ExternalDocumentation';
import { Node } from './Node';

import type { OpenAPI } from './OpenAPI';
import type { TagModel } from './types';
import type { CommonMarkString, Nullable, URLString } from '@fresha/api-tools-core';

type TagParent = OpenAPI;

export class Tag extends Node<TagParent> implements TagModel {
  #name: string;
  #description: Nullable<CommonMarkString>;
  #externalDocs: Nullable<ExternalDocumentation>;

  constructor(parent: TagParent, name: string) {
    super(parent);
    this.#name = name;
    this.#description = null;
    this.#externalDocs = null;
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
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
    if (this.#externalDocs) {
      this.#externalDocs.dispose();
      this.#externalDocs = null;
    }
  }
}

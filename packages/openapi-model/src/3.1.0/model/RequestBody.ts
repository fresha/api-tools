import assert from 'assert';

import { CommonMarkString, MIMETypeString, Nullable } from '@fresha/api-tools-core';

import { MediaType } from './MediaType';
import { Node } from './Node';

import type { Components } from './Components';
import type { Operation } from './Operation';
import type { RequestBodyModel } from './types';

type RequestBodyParent = Components | Operation;

export class RequestBody extends Node<RequestBodyParent> implements RequestBodyModel {
  #description: Nullable<CommonMarkString>;
  readonly #content: Map<MIMETypeString, MediaType>;
  #required: boolean;

  constructor(parent: RequestBodyParent) {
    super(parent);
    this.#description = null;
    this.#content = new Map<MIMETypeString, MediaType>();
    this.#required = false;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }

  get mediaTypeCount(): number {
    return this.#content.size;
  }

  mediaTypeKeys(): IterableIterator<MIMETypeString> {
    return this.#content.keys();
  }

  mediaTypes(): IterableIterator<[MIMETypeString, MediaType]> {
    return this.#content.entries();
  }

  hasMediaType(mediaType: MIMETypeString): boolean {
    return this.#content.has(mediaType);
  }

  addMediaType(mediaType: MIMETypeString): MediaType {
    assert(!this.hasMediaType(mediaType), `Media type for '${mediaType}' already exists`);
    const result = new MediaType(this);
    this.#content.set(mediaType, result);
    return result;
  }

  deleteMediaType(key: MIMETypeString): void {
    const mediaType = this.#content.get(key);
    if (mediaType) {
      mediaType.dispose();
      this.#content.delete(key);
    }
  }

  clearMediaTypes(): void {
    this.#content.forEach(c => c.dispose());
    this.#content.clear();
  }

  get required(): boolean {
    return this.#required;
  }

  set required(value: boolean) {
    this.#required = value;
  }
}

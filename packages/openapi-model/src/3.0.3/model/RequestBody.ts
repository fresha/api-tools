import assert from 'assert';

import { BasicNode } from './BasicNode';
import { MediaType } from './MediaType';

import type { RequestBodyModel, RequestBodyModelParent } from './types';
import type { CommonMarkString, MIMETypeString, Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#request-body-object
 */
export class RequestBody extends BasicNode<RequestBodyModelParent> implements RequestBodyModel {
  #description: Nullable<CommonMarkString>;
  readonly #content: Map<MIMETypeString, MediaType>;
  #required: boolean;

  constructor(parent: RequestBodyModelParent) {
    super(parent);
    this.#description = null;
    this.#content = new Map<string, MediaType>();
    this.#required = false;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }

  get required(): boolean {
    return this.#required;
  }

  set required(value: boolean) {
    this.#required = value;
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

  hasMediaType(mimeType: MIMETypeString): boolean {
    return this.#content.has(mimeType);
  }

  getMediaType(mimeType: MIMETypeString): MediaType | undefined {
    return this.#content.get(mimeType);
  }

  getMediaTypeOrThrow(mimeType: MIMETypeString): MediaType {
    const result = this.getMediaType(mimeType);
    assert(result, `Media type for '${mimeType}' is missing`);
    return result;
  }

  setMediaType(mimeType: MIMETypeString): MediaType {
    const result = new MediaType(this);
    this.#content.set(mimeType, result);
    return result;
  }

  deleteMediaType(mimeType: MIMETypeString): void {
    this.#content.delete(mimeType);
  }

  clearMediaTypes(): void {
    this.#content.clear();
  }
}

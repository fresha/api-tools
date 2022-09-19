import { BasicNode } from './BasicNode';
import { MediaType } from './MediaType';

import type { Components } from './Components';
import type { Operation } from './Operation';
import type { MIMETypeString, RequestBodyModel } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export type RequestBodyParent = Components | Operation;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#request-body-object
 */
export class RequestBody extends BasicNode<RequestBodyParent> implements RequestBodyModel {
  description: Nullable<string>;
  readonly content: Map<MIMETypeString, MediaType>;
  required: boolean;

  constructor(parent: RequestBodyParent) {
    super(parent);
    this.description = null;
    this.content = new Map<string, MediaType>();
    this.required = false;
  }

  setContent(mimeType: MIMETypeString): MediaType {
    const result = new MediaType(this);
    this.content.set(mimeType, result);
    return result;
  }

  deleteContent(mimeType: MIMETypeString): void {
    this.content.delete(mimeType);
  }

  clearContent(): void {
    this.content.clear();
  }
}

import { BasicNode } from './BasicNode';
import { MediaType } from './MediaType';

import type { MediaTypeModel, RequestBodyModel, RequestBodyModelParent } from './types';
import type { MIMETypeString, Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#request-body-object
 */
export class RequestBody extends BasicNode<RequestBodyModelParent> implements RequestBodyModel {
  description: Nullable<string>;
  readonly content: Map<MIMETypeString, MediaTypeModel>;
  required: boolean;

  constructor(parent: RequestBodyModelParent) {
    super(parent);
    this.description = null;
    this.content = new Map<string, MediaTypeModel>();
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

import { BasicNode } from './BasicNode';
import { MediaType } from './MediaType';

import type { Components } from './Components';
import type { Header } from './Header';
import type { Link } from './Link';
import type { Responses } from './Responses';
import type { MediaTypeModel, MIMETypeString, ResponseModel } from './types';

export type ResponseParent = Components | Responses;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#response-object
 */
export class Response extends BasicNode<ResponseParent> implements ResponseModel {
  description: string;
  readonly headers: Map<string, Header>;
  readonly content: Map<MIMETypeString, MediaType>;
  readonly links: Map<string, Link>;

  constructor(parent: ResponseParent, description: string) {
    super(parent);
    this.description = description;
    this.headers = new Map<string, Header>();
    this.content = new Map<string, MediaType>();
    this.links = new Map<string, Link>();
  }

  setContent(mimeType: MIMETypeString): MediaTypeModel {
    if (this.content.has(mimeType)) {
      throw new Error(`Duplicate content for ${mimeType}`);
    }
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

import { BasicNode } from './BasicNode';
import { Header } from './Header';
import { Link } from './Link';
import { MediaType } from './MediaType';

import type {
  HeaderModel,
  LinkModel,
  MediaTypeModel,
  ResponseModel,
  ResponseModelParent,
} from './types';
import type { MIMETypeString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#response-object
 */
export class Response extends BasicNode<ResponseModelParent> implements ResponseModel {
  description: string;
  readonly headers: Map<string, HeaderModel>;
  readonly content: Map<MIMETypeString, MediaTypeModel>;
  readonly links: Map<string, LinkModel>;

  constructor(parent: ResponseModelParent, description: string) {
    super(parent);
    this.description = description;
    this.headers = new Map<string, HeaderModel>();
    this.content = new Map<string, MediaTypeModel>();
    this.links = new Map<string, LinkModel>();
  }

  setHeader(name: string): HeaderModel {
    const result = new Header(this);
    this.headers.set(name, result);
    return result;
  }

  deleteHeader(name: string): void {
    this.headers.delete(name);
  }

  clearHeaders(): void {
    this.headers.clear();
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

  setLink(key: string): LinkModel {
    const result = new Link(this);
    this.links.set(key, result);
    return result;
  }

  deleteLink(key: string): void {
    this.links.delete(key);
  }

  clearLinks(): void {
    this.links.clear();
  }
}

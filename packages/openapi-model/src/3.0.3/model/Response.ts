import assert from 'assert';

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
  TreeNode,
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

  *children(): IterableIterator<TreeNode<unknown>> {
      for (const header of this.headers.values()) {
        yield header
      }
      for (const content of this.content.values()) {
        yield content;
      }
      for (const link of this.links.values()) {
        yield link;
      }
  }

  getHeader(name: string): HeaderModel | undefined {
    return this.headers.get(name);
  }

  getHeaderOrThrow(name: string): HeaderModel {
    const result = this.getHeader(name);
    assert(result);
    return result;
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

  getContent(mimeType: MIMETypeString): MediaTypeModel | undefined {
    return this.content.get(mimeType);
  }

  getContentOrThrow(mimeType: MIMETypeString): MediaTypeModel {
    const result = this.getContent(mimeType);
    assert(result);
    return result;
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

  getLink(key: string): LinkModel | undefined {
    return this.links.get(key);
  }

  getLinkOrThrow(key: string): LinkModel {
    const result = this.getLink(key);
    assert(result);
    return result;
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

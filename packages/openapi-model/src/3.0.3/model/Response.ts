import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Header } from './Header';
import { Link } from './Link';
import { MediaType } from './MediaType';

import type { ResponseModel, ResponseModelParent } from './types';
import type { CommonMarkString, MIMETypeString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#response-object
 */
export class Response extends BasicNode<ResponseModelParent> implements ResponseModel {
  #description: CommonMarkString;
  readonly #headers: Map<string, Header>;
  readonly #content: Map<MIMETypeString, MediaType>;
  readonly #links: Map<string, Link>;

  constructor(parent: ResponseModelParent, description: string) {
    super(parent);
    this.#description = description;
    this.#headers = new Map<string, Header>();
    this.#content = new Map<string, MediaType>();
    this.#links = new Map<string, Link>();
  }

  get description(): CommonMarkString {
    return this.#description;
  }

  set description(value: CommonMarkString) {
    this.#description = value;
  }

  get headerCount(): number {
    return this.#headers.size;
  }

  headerKeys(): IterableIterator<string> {
    return this.#headers.keys();
  }

  headers(): IterableIterator<[string, Header]> {
    return this.#headers.entries();
  }

  hasHeader(name: string): boolean {
    return this.#headers.has(name);
  }

  getHeader(name: string): Header | undefined {
    return this.#headers.get(name);
  }

  getHeaderOrThrow(name: string): Header {
    const result = this.getHeader(name);
    assert(result, `Header '${name}' does not exist`);
    return result;
  }

  setHeader(name: string): Header {
    assert(!this.hasHeader(name), `Header '${name}' already exists`);
    const result = new Header(this);
    this.#headers.set(name, result);
    return result;
  }

  deleteHeader(name: string): void {
    this.#headers.delete(name);
  }

  clearHeaders(): void {
    this.#headers.clear();
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
    assert(result, `Media type '${mimeType}' does not exist`);
    return result;
  }

  setMediaType(mimeType: MIMETypeString): MediaType {
    assert(!this.hasMediaType(mimeType), `Media type '${mimeType}' already exists`);
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

  get linkCount(): number {
    return this.#links.size;
  }

  linkKeys(): IterableIterator<string> {
    return this.#links.keys();
  }

  links(): IterableIterator<[string, Link]> {
    return this.#links.entries();
  }

  hasLink(key: string): boolean {
    return this.#links.has(key);
  }

  getLink(key: string): Link | undefined {
    return this.#links.get(key);
  }

  getLinkOrThrow(key: string): Link {
    const result = this.getLink(key);
    assert(result);
    return result;
  }

  setLink(key: string): Link {
    assert(!this.hasLink(key), `Link '${key}' already exists`);
    const result = new Link(this);
    this.#links.set(key, result);
    return result;
  }

  setLinkModel(key: string, link: Link): void {
    assert(!this.hasLink(key), `Link '${key}' already exists`);
    this.#links.set(key, link);
  }

  deleteLink(key: string): void {
    this.#links.delete(key);
  }

  clearLinks(): void {
    this.#links.clear();
  }
}

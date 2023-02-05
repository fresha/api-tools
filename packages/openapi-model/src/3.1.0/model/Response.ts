import assert from 'assert';

import { Header } from './Header';
import { Link } from './Link';
import { MediaType } from './MediaType';
import { Node } from './Node';

import type { Components } from './Components';
import type { Operation } from './Operation';
import type { Responses } from './Responses';
import type { ResponseModel } from './types';
import type { CommonMarkString, MIMETypeString } from '@fresha/api-tools-core';

type ResposeParent = Components | Operation | Responses;

export class Response extends Node<ResposeParent> implements ResponseModel {
  #description: CommonMarkString;
  readonly #headers: Map<string, Header>;
  readonly #content: Map<MIMETypeString, MediaType>;
  readonly #links: Map<string, Link>;

  constructor(parent: ResposeParent, description: CommonMarkString) {
    super(parent);
    assert(!!description, 'Response description cannot be empty');
    this.#description = description;
    this.#headers = new Map<string, Header>();
    this.#content = new Map<MIMETypeString, MediaType>();
    this.#links = new Map<string, Link>();
  }

  get description(): CommonMarkString {
    return this.#description;
  }

  set description(value: CommonMarkString) {
    if (this.#description !== value) {
      assert(!!value, 'Response description cannot be empty');
      this.#description = value;
    }
  }

  get headerCount(): number {
    return this.#headers.size;
  }

  headerNames(): IterableIterator<string> {
    return this.#headers.keys();
  }

  headers(): IterableIterator<[string, Header]> {
    return this.#headers.entries();
  }

  hasHeader(name: string): boolean {
    return this.#headers.has(name);
  }

  getHeader(name: string): Header {
    const result = this.#headers.get(name);
    assert(result, `Header ${name} is missing`);
    return result;
  }

  addHeader(name: string): Header {
    assert(!this.hasHeader(name), `Header ${name} is already set`);
    const result = new Header(this);
    this.#headers.set(name, result);
    return result;
  }

  deleteHeader(name: string): void {
    const header = this.#headers.get(name);
    if (header) {
      header.dispose();
      this.#headers.delete(name);
    }
  }

  clearHeaders(): void {
    this.#headers.forEach(h => h.dispose());
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

  hasMediaType(mediaType: MIMETypeString): boolean {
    return this.#content.has(mediaType);
  }

  addMediaType(key: MIMETypeString): MediaType {
    assert(!this.hasMediaType(key), `Media type for key '${key}' already exists`);
    const result = new MediaType(this);
    this.#content.set(key, result);
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
    this.#content.forEach(m => m.dispose());
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

  getLink(key: string): Link {
    const result = this.#links.get(key);
    assert(result, `Link for key ${key} is missing`);
    return result;
  }

  addLink(key: string): Link {
    assert(!this.hasLink(key), `Link for key ${key} already exists`);
    const result = new Link(this);
    this.#links.set(key, result);
    return result;
  }

  deleteLink(key: string): void {
    const link = this.#links.get(key);
    if (link) {
      link.dispose();
      this.#links.delete(key);
    }
  }

  clearLinks(): void {
    this.#links.forEach(l => l.dispose());
    this.#links.clear();
  }
}

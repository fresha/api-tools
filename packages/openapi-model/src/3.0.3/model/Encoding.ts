import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Header } from './Header';

import type { EncodingModel, EncodingModelParent, EncodingSerializationStyle } from './types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#encoding-object
 */
export class Encoding extends BasicNode<EncodingModelParent> implements EncodingModel {
  #contentType: Nullable<string>;
  readonly #headers: Map<string, Header>;
  #style: EncodingSerializationStyle;
  #explode: boolean;
  #allowReserved: boolean;

  constructor(parent: EncodingModelParent, contentType: string) {
    super(parent);
    this.#contentType = contentType;
    this.#headers = new Map<string, Header>();
    this.#style = 'form';
    this.#explode = false;
    this.#allowReserved = false;
  }

  get contentType(): Nullable<string> {
    return this.#contentType;
  }

  set contentType(value: Nullable<string>) {
    this.#contentType = value;
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

  getHeader(name: string): Header | undefined {
    return this.#headers.get(name);
  }

  getHeaderOrThrow(name: string): Header {
    const result = this.getHeader(name);
    assert(result);
    return result;
  }

  setHeader(name: string): Header {
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

  get style(): EncodingSerializationStyle {
    return this.#style;
  }

  set style(value: EncodingSerializationStyle) {
    this.#style = value;
  }

  get explode(): boolean {
    return this.#explode;
  }

  set explode(value: boolean) {
    this.#explode = value;
  }

  get allowReserved(): boolean {
    return this.#allowReserved;
  }

  set allowReserved(value: boolean) {
    this.#allowReserved = value;
  }
}

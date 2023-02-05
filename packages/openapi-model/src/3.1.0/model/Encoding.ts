import assert from 'assert';

import { Header } from './Header';
import { Node } from './Node';

import type { MediaType } from './MediaType';
import type { EncodingModel, EncodingSerializationStyle } from './types';
import type { Nullable } from '@fresha/api-tools-core';

type EncodingParent = MediaType;

export class Encoding extends Node<EncodingParent> implements EncodingModel {
  #contentType: Nullable<string>;
  #headers: Map<string, Header>;
  #style: EncodingSerializationStyle;
  #explode: boolean;
  #allowReserved: boolean;

  constructor(parent: EncodingParent) {
    super(parent);
    this.#contentType = null;
    this.#headers = new Map<string, Header>();
    this.#style = 'form';
    this.#explode = true;
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

  addHeader(name: string): Header {
    assert(!this.hasHeader(name), `Header '${name}' already exists`);
    const result = new Header(this);
    this.#headers.set(name, result);
    return result;
  }

  deleteHeader(name: string): void {
    const header = this.#headers.get(name);
    if (header) {
      if (header.parent === this) {
        header.dispose();
      }
      this.#headers.delete(name);
    }
  }

  clearHeaders(): void {
    this.#headers.forEach(h => h.dispose());
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

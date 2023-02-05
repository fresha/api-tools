import { assert } from 'console';

import { Encoding } from './Encoding';
import { Example } from './Example';
import { Node } from './Node';
import { Schema } from './Schema';

import type { Header } from './Header';
import type { ParameterBase } from './Parameter';
import type { RequestBody } from './RequestBody';
import type { Response } from './Response';
import type { MediaTypeModel } from './types';
import type { Nullable } from '@fresha/api-tools-core';

type MediaTypeParent = ParameterBase | RequestBody | Response | Header;

export class MediaType extends Node<MediaTypeParent> implements MediaTypeModel {
  #schema: Nullable<Schema>;
  #examples: Map<string, Example>;
  #encodings: Map<string, Encoding>;

  constructor(parent: MediaTypeParent) {
    super(parent);
    this.#schema = null;
    this.#examples = new Map<string, Example>();
    this.#encodings = new Map<string, Encoding>();
  }

  get schema(): Nullable<Schema> {
    return this.#schema;
  }

  addSchema(): Schema {
    assert(!this.#schema, `Schema already exists`);
    this.#schema = new Schema(this);
    return this.#schema;
  }

  deleteSchema(): void {
    if (this.#schema) {
      if (this.#schema.parent === this) {
        this.#schema.dispose();
      }
      this.#schema = null;
    }
  }

  get exampleCount(): number {
    return this.#examples.size;
  }

  exampleKeys(): IterableIterator<string> {
    return this.#examples.keys();
  }

  examples(): IterableIterator<[string, Example]> {
    return this.#examples.entries();
  }

  hasExample(key: string): boolean {
    return this.#examples.has(key);
  }

  addExample(key: string): Example {
    assert(!this.hasExample(key), `Example for key '${key}' already exists`);
    const result = new Example(this);
    this.#examples.set(key, result);
    return result;
  }

  deleteExample(key: string): void {
    const example = this.#examples.get(key);
    if (example) {
      example.dispose();
      this.#examples.delete(key);
    }
  }

  clearExamples(): void {
    this.#examples.forEach(e => e.dispose());
    this.#examples.clear();
  }

  get encodingCount(): number {
    return this.#encodings.size;
  }

  encodingKeys(): IterableIterator<string> {
    return this.#encodings.keys();
  }

  encodings(): IterableIterator<[string, Encoding]> {
    return this.#encodings.entries();
  }

  hasEncoding(key: string): boolean {
    return this.#encodings.has(key);
  }

  addEncoding(key: string): Encoding {
    assert(!this.hasEncoding(key), `Encoding '${key}' already exists`);
    const result = new Encoding(this);
    this.#encodings.set(key, result);
    return result;
  }

  deleteEncoding(key: string): void {
    const encoding = this.#encodings.get(key);
    if (encoding) {
      encoding.dispose();
      this.#encodings.delete(key);
    }
  }

  clearEncodings(): void {
    this.#encodings.forEach(e => e.dispose());
    this.#encodings.clear();
  }
}

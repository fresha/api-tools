import assert from 'assert';

import { Example } from '../Example';
import { MediaType } from '../MediaType';
import { Node } from '../Node';
import { Schema } from '../Schema';

import type { Components } from '../Components';
import type { Operation } from '../Operation';
import type { PathItem } from '../PathItem';
import type { ParameterModelBase } from '../types';
import type { CommonMarkString, MIMETypeString, Nullable } from '@fresha/api-tools-core';

export type ParameterParent = Components | PathItem | Operation;

export class ParameterBase extends Node<ParameterParent> implements ParameterModelBase {
  #name: string;
  #description: Nullable<CommonMarkString>;
  #deprecated: boolean;
  #explode: boolean;
  #schema: Nullable<Schema>;
  #examples: Map<string, Example>;
  #content: Map<MIMETypeString, MediaType>;

  constructor(parent: ParameterParent, name: string) {
    super(parent);
    this.#name = name;
    this.#description = null;
    this.#deprecated = false;
    this.#explode = false;
    this.#schema = null;
    this.#examples = new Map<string, Example>();
    this.#content = new Map<MIMETypeString, MediaType>();
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    this.#name = value;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  get deprecated(): boolean {
    return this.#deprecated;
  }

  get explode(): boolean {
    return this.#explode;
  }

  get schema(): Nullable<Schema> {
    return this.#schema;
  }

  addSchema(): Schema {
    assert(!this.#schema, 'Schema already exists');
    this.#schema = new Schema(this);
    return this.#schema;
  }

  deleteSchema(): void {
    if (this.#schema) {
      this.#schema.dispose();
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
}

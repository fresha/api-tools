import assert from 'assert';

import { HeaderParameterSerializationStyle } from '../../baseTypes';

import { Example } from './Example';
import { MediaType } from './MediaType';
import { Node } from './Node';
import { Schema } from './Schema';

import type { Components } from './Components';
import type { Encoding } from './Encoding';
import type { Response } from './Response';
import type { HeaderModel } from './types';
import type { CommonMarkString, MIMETypeString, Nullable } from '@fresha/api-tools-core';

type HeaderParent = Components | Response | Encoding;

export class Header extends Node<HeaderParent> implements HeaderModel {
  #description: Nullable<CommonMarkString>;
  #required: boolean;
  #deprecated: boolean;
  #style: HeaderParameterSerializationStyle;
  #explode: boolean;
  #schema: Nullable<Schema>;
  readonly #examples: Map<string, Example>;
  readonly #content: Map<MIMETypeString, MediaType>;

  constructor(parent: HeaderParent) {
    super(parent);
    this.#description = null;
    this.#required = false;
    this.#deprecated = false;
    this.#style = 'simple';
    this.#explode = false;
    this.#schema = null;
    this.#examples = new Map<string, Example>();
    this.#content = new Map<MIMETypeString, MediaType>();
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }

  get required(): boolean {
    return this.#required;
  }

  set required(value: boolean) {
    this.#required = value;
  }

  get deprecated(): boolean {
    return this.#deprecated;
  }

  set deprecated(value: boolean) {
    this.#deprecated = value;
  }

  get style(): HeaderParameterSerializationStyle {
    return this.#style;
  }

  set style(value: HeaderParameterSerializationStyle) {
    this.#style = value;
  }

  get explode(): boolean {
    return this.#explode;
  }

  set explode(value: boolean) {
    this.#explode = value;
  }

  get schema(): Nullable<Schema> {
    return this.#schema;
  }

  addSchema(): Schema {
    assert(!this.#schema, 'Schema is already set');
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
    this.#examples.forEach(ex => ex.dispose());
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

  addMediaType(mediaType: MIMETypeString): MediaType {
    assert(!this.hasMediaType(mediaType), `Content for '${mediaType}' already set`);
    const result = new MediaType(this);
    this.#content.set(mediaType, result);
    return result;
  }

  deleteMediaType(mediaType: MIMETypeString): void {
    const item = this.#content.get(mediaType);
    if (item) {
      item.dispose();
      this.#content.delete(mediaType);
    }
  }

  clearMediaTypes(): void {
    this.#content.forEach(item => item.dispose());
    this.#content.clear();
  }
}

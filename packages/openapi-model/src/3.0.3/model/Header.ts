import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Example } from './Example';
import { MediaType } from './MediaType';
import { isSchemaModel, Schema, SchemaFactory } from './Schema';

import type {
  CreateOrSetSchemaOptions,
  HeaderModel,
  HeaderModelParent,
  HeaderParameterSerializationStyle,
} from './types';
import type { Nullable, JSONValue, MIMETypeString, CommonMarkString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#header-object
 */
export class Header extends BasicNode<HeaderModelParent> implements HeaderModel {
  #description: Nullable<CommonMarkString>;
  #required: boolean;
  #deprecated: boolean;
  #style: HeaderParameterSerializationStyle;
  #explode: boolean;
  #schema: Nullable<Schema>;
  #example: JSONValue;
  readonly #examples: Map<string, Example>;
  readonly #content: Map<MIMETypeString, MediaType>;

  constructor(parent: HeaderModelParent) {
    super(parent);
    this.#description = null;
    this.#required = false;
    this.#deprecated = false;
    this.#style = 'simple';
    this.#explode = false;
    this.#schema = null;
    this.#example = null;
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

  setSchema(options: CreateOrSetSchemaOptions): Schema {
    assert(!this.#schema, 'Schema is already set');
    this.#schema = (
      isSchemaModel(options) ? options : SchemaFactory.create(this, options)
    ) as Schema;
    return this.#schema;
  }

  deleteSchema(): void {
    if (this.#schema) {
      this.#schema.dispose();
      this.#schema = null;
    }
  }

  get example(): JSONValue {
    return this.#example;
  }

  set example(value: JSONValue) {
    this.#example = value;
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

  hasExample(name: string): boolean {
    return this.#examples.has(name);
  }

  getExample(name: string): Example | undefined {
    return this.#examples.get(name);
  }

  getExampleOrThrow(name: string): Example {
    const result = this.getExample(name);
    assert(result, `Example named '${name}' does not exist`);
    return result;
  }

  setExample(name: string): Example {
    assert(!this.hasExample(name), `Duplicate example named '${name}'`);
    const result = new Example(this);
    this.#examples.set(name, result);
    return result;
  }

  setExampleModel(name: string, model: Example): void {
    assert(!this.hasExample(name), `Duplicate example named '${name}'`);
    assert(
      !Array.from(this.#examples.values()).includes(model),
      `Duplicate example model for name '${name}'`,
    );
    this.#examples.set(name, model);
  }

  deleteExample(name: string): void {
    this.#examples.delete(name);
  }

  clearExamples(): void {
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

  hasMediaType(mimeType: MIMETypeString): boolean {
    return this.#content.has(mimeType);
  }

  getMediaType(mimeType: MIMETypeString): MediaType | undefined {
    return this.#content.get(mimeType);
  }

  getMediaTypeOrThrow(mimeType: MIMETypeString): MediaType {
    const result = this.getMediaType(mimeType);
    assert(result, `Content for media type '${mimeType}' does not exist`);
    return result;
  }

  setMediaType(mimeType: MIMETypeString): MediaType {
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
}

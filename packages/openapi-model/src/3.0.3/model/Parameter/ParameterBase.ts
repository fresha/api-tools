import assert from 'assert';

import { BasicNode } from '../BasicNode';
import { Example } from '../Example';
import { MediaType } from '../MediaType';
import { isSchemaModel, Schema, SchemaFactory } from '../Schema';

import type {
  CreateOrSetSchemaOptions,
  ExampleModelParent,
  MediaTypeModelParent,
  ParameterBaseModel,
  ParameterLocation,
  ParameterModelParent,
  SchemaModelParent,
} from '../types';
import type { CommonMarkString, JSONValue, MIMETypeString, Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export abstract class ParameterBase<TLocation extends ParameterLocation>
  extends BasicNode<ParameterModelParent>
  implements ParameterBaseModel
{
  readonly #in: TLocation;
  readonly #name: string;
  #description: Nullable<string>;
  #deprecated: boolean;
  #explode: boolean;
  #schema: Nullable<Schema>;
  readonly #content: Map<MIMETypeString, MediaType>;
  #example: JSONValue;
  readonly #examples: Map<string, Example>;

  constructor(parent: ParameterModelParent, location: TLocation, name: string) {
    super(parent);
    this.#name = name;
    this.#in = location;
    this.#description = null;
    this.#deprecated = false;
    this.#explode = false;
    this.#schema = null;
    this.#content = new Map<MIMETypeString, MediaType>();
    this.#example = null;
    this.#examples = new Map<string, Example>();
  }

  get in(): TLocation {
    return this.#in;
  }

  get name(): string {
    return this.#name;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }

  get deprecated(): boolean {
    return this.#deprecated;
  }

  set deprecated(value: boolean) {
    this.#deprecated = value;
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

  setSchema(params: CreateOrSetSchemaOptions): Schema {
    assert(this.#schema === null, 'Schema already set');
    if (isSchemaModel(params)) {
      this.#schema = params as Schema;
    } else {
      this.#schema = SchemaFactory.create(this as unknown as SchemaModelParent, params) as Schema;
    }
    return this.#schema;
  }

  deleteSchema(): void {
    this.#schema = null;
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
    assert(result, `Cannot find example named '${name}'`);
    return result;
  }

  setExampleModel(name: string, model: Example): void {
    assert(!this.hasExample(name), `Example named '${name}' has already been set`);
    this.#examples.set(name, model);
  }

  setExample(name: string): Example {
    assert(!this.hasExample(name), `Example named '${name}' has already been set`);
    const result = new Example(this as unknown as ExampleModelParent);
    this.#examples.set(name, result);
    return result;
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
    assert(result, `Cannot find content for media type '${mimeType}'`);
    return result;
  }

  setMediaTypeModel(mimeType: MIMETypeString, model: MediaType): void {
    assert(
      !this.#content.has(mimeType),
      `Content for mime type '${mimeType}' has already been set`,
    );
    assert.equal(model.parent, this, `Wrong parent for content model`);
    this.#content.set(mimeType, model);
  }

  setMediaType(key: MIMETypeString): MediaType {
    assert(!this.#content.has(key), `Content for mime type '${key}' has already been set`);
    const result = new MediaType(this as unknown as MediaTypeModelParent);
    this.#content.set(key, result);
    return result;
  }

  deleteMediaType(key: MIMETypeString): void {
    this.#content.delete(key);
  }

  clearMediaTypes(): void {
    this.#content.clear();
  }
}

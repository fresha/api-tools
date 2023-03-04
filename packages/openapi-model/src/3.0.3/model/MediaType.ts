import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Encoding } from './Encoding';
import { Example } from './Example';
import { Schema, SchemaFactory } from './Schema';

import type {
  EncodingModel,
  ExampleModel,
  MediaTypeModel,
  MediaTypeModelParent,
  CreateOrSetSchemaOptions,
  SchemaModel,
} from './types';
import type { Nullable, JSONValue } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#media-type-object
 */
export class MediaType extends BasicNode<MediaTypeModelParent> implements MediaTypeModel {
  #schema: Nullable<Schema>;
  #example: JSONValue;
  readonly #examples: Map<string, Example>;
  readonly #encoding: Map<string, Encoding>;

  constructor(parent: MediaTypeModelParent) {
    super(parent);
    this.#schema = null;
    this.#example = null;
    this.#examples = new Map<string, Example>();
    this.#encoding = new Map<string, Encoding>();
  }

  get schema(): Nullable<SchemaModel> {
    return this.#schema;
  }

  setSchema(options: CreateOrSetSchemaOptions): Schema {
    assert(!this.#schema, 'Schema is already set');
    this.#schema = SchemaFactory.createOrGet(this, options) as Schema;
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

  examples(): IterableIterator<[string, ExampleModel]> {
    return this.#examples.entries();
  }

  hasExample(name: string): boolean {
    return this.#examples.has(name);
  }

  getExample(key: string): ExampleModel | undefined {
    return this.#examples.get(key);
  }

  getExampleOrThrow(key: string): ExampleModel {
    const result = this.getExample(key);
    assert(result, `Example named '${key}' does not exist`);
    return result;
  }

  setExample(key: string): ExampleModel {
    assert.equal(this.example, null);
    const result = new Example(this);
    this.#examples.set(key, result);
    return result;
  }

  setExampleModel(name: string, model: ExampleModel): void {
    assert(!this.hasExample(name), `Duplicate example for key '${name}'`);
    assert(model instanceof Example, `Unsupported example implementation`);
    assert(
      !Array.from(this.#examples.values()).includes(model),
      `Duplicate example model for key '${name}'`,
    );
    this.#examples.set(name, model);
  }

  deleteExample(key: string): void {
    this.#examples.delete(key);
  }

  clearExamples(): void {
    this.#examples.clear();
  }

  get encodingCount(): number {
    return this.#encoding.size;
  }

  encodingKeys(): IterableIterator<string> {
    return this.#encoding.keys();
  }

  encodings(): IterableIterator<[string, EncodingModel]> {
    return this.#encoding.entries();
  }

  hasEncoding(key: string): boolean {
    return this.#encoding.has(key);
  }

  getEncoding(key: string): EncodingModel | undefined {
    return this.#encoding.get(key);
  }

  getEncodingOrThrow(key: string): EncodingModel {
    const result = this.getEncoding(key);
    assert(result, `Cannot find encoding named '${key}'`);
    return result;
  }

  setEncoding(key: string): EncodingModel {
    const result = new Encoding(this, 'application/json');
    this.#encoding.set(key, result);
    return result;
  }

  deleteEncoding(key: string): void {
    this.#encoding.delete(key);
  }

  clearEncodings(): void {
    this.#encoding.clear();
  }
}

import assert from 'assert';

import { SchemaType } from '../types';

import { BasicNode } from './BasicNode';
import { Encoding } from './Encoding';
import { Example } from './Example';
import { SchemaFactory } from './Schema';

import type {
  EncodingModel,
  ExampleModel,
  MediaTypeModel,
  MediaTypeModelParent,
  SchemaModel,
} from './types';
import type { Nullable, JSONValue } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#media-type-object
 */
export class MediaType extends BasicNode<MediaTypeModelParent> implements MediaTypeModel {
  schema: Nullable<SchemaModel>;
  example: JSONValue;
  readonly examples: Map<string, ExampleModel>;
  readonly encoding: Map<string, EncodingModel>;

  constructor(parent: MediaTypeModelParent) {
    super(parent);
    this.schema = null;
    this.example = null;
    this.examples = new Map<string, ExampleModel>();
    this.encoding = new Map<string, EncodingModel>();
  }

  setSchema(type: SchemaType): SchemaModel {
    const result = SchemaFactory.create(this, type);
    this.schema = result;
    return result;
  }

  deleteSchema(): void {
    this.schema = null;
  }

  setExample(key: string): ExampleModel {
    assert.equal(this.example, null);
    const result = new Example(this);
    this.examples.set(key, result);
    return result;
  }

  deleteExample(key: string): void {
    this.examples.delete(key);
  }

  clearExamples(): void {
    this.examples.clear();
  }

  setEncoding(key: string): EncodingModel {
    const result = new Encoding(this, 'application/json');
    this.encoding.set(key, result);
    return result;
  }

  deleteEncoding(key: string): void {
    this.encoding.delete(key);
  }

  clearEncodings(): void {
    this.encoding.clear();
  }
}

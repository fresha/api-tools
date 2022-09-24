import assert from 'assert';

import { BasicNode } from '../BasicNode';
import { Example } from '../Example';
import { MediaType } from '../MediaType';

import type {
  ExampleModel,
  ExampleModelParent,
  MediaTypeModel,
  MediaTypeModelParent,
  ParameterLocation,
  ParameterModelParent,
  SchemaModel,
} from '../types';
import type { JSONValue, MIMETypeString, Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export abstract class ParameterBase extends BasicNode<ParameterModelParent> {
  readonly in: ParameterLocation;
  readonly name: string;
  description: Nullable<string>;
  deprecated: boolean;
  schema: Nullable<SchemaModel>;
  readonly content: Map<MIMETypeString, MediaTypeModel>;
  example: JSONValue;
  readonly examples: Map<string, ExampleModel>;
  required: boolean;

  constructor(parent: ParameterModelParent, location: ParameterLocation, name: string) {
    super(parent);
    this.name = name;
    this.in = location;
    this.description = null;
    this.deprecated = false;
    this.schema = null;
    this.content = new Map<MIMETypeString, MediaTypeModel>();
    this.example = null;
    this.examples = new Map<string, ExampleModel>();
    this.required = false;
  }

  setExampleModel(name: string, model: ExampleModel): void {
    assert(!this.examples.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.examples.values()).includes(model));
    this.examples.set(name, model);
  }

  setExample(name: string): ExampleModel {
    const result = new Example(this as unknown as ExampleModelParent);
    this.examples.set(name, result);
    return result;
  }

  deleteExample(name: string): void {
    this.examples.delete(name);
  }

  clearExamples(): void {
    this.examples.clear();
  }

  setContentModel(mimeType: MIMETypeString, model: MediaTypeModel): void {
    assert(!this.content.has(mimeType));
    assert.equal(model.parent, this);
    assert(!Array.from(this.content.values()).includes(model));
    this.content.set(mimeType, model);
  }

  setContent(key: MIMETypeString): MediaTypeModel {
    const result = new MediaType(this as unknown as MediaTypeModelParent);
    this.content.set(key, result);
    return result;
  }

  deleteContent(key: MIMETypeString): void {
    this.content.delete(key);
  }

  clearContent(): void {
    this.content.clear();
  }
}

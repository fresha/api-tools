import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Example } from './Example';
import { MediaType } from './MediaType';

import type {
  ExampleModel,
  HeaderModel,
  HeaderModelParent,
  HeaderParameterSerializationStyle,
  MediaTypeModel,
  SchemaModel,
} from './types';
import type { Nullable, JSONValue, MIMETypeString, CommonMarkString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#header-object
 */
export class Header extends BasicNode<HeaderModelParent> implements HeaderModel {
  description: Nullable<CommonMarkString>;
  required: boolean;
  deprecated: boolean;
  style: HeaderParameterSerializationStyle;
  explode: boolean;
  schema: Nullable<SchemaModel>;
  example: JSONValue;
  readonly examples: Map<string, ExampleModel>;
  readonly content: Map<MIMETypeString, MediaTypeModel>;

  constructor(parent: HeaderModelParent) {
    super(parent);
    this.description = null;
    this.required = false;
    this.deprecated = false;
    this.style = 'simple';
    this.explode = false;
    this.schema = null;
    this.example = null;
    this.examples = new Map<string, ExampleModel>();
    this.content = new Map<MIMETypeString, MediaTypeModel>();
  }

  getExample(name: string): ExampleModel | undefined {
    return this.examples.get(name);
  }

  getExampleOrThrow(name: string): ExampleModel {
    const result = this.getExample(name);
    assert(result);
    return result;
  }

  setExample(name: string): ExampleModel {
    const result = new Example(this);
    this.examples.set(name, result);
    return result;
  }

  deleteExample(name: string): void {
    this.examples.delete(name);
  }

  clearExamples(): void {
    this.examples.clear();
  }

  getContent(mimeType: MIMETypeString): MediaTypeModel | undefined {
    return this.content.get(mimeType);
  }

  getContentOrThrow(mimeType: MIMETypeString): MediaTypeModel {
    const result = this.getContent(mimeType);
    assert(result);
    return result;
  }

  setContent(mimeType: MIMETypeString): void {
    const result = new MediaType(this);
    this.content.set(mimeType, result);
  }

  deleteContent(mimeType: MIMETypeString): void {
    this.content.delete(mimeType);
  }

  clearContents(): void {
    this.content.clear();
  }
}

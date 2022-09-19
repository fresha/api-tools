import { SchemaType } from '../types';

import { BasicNode } from './BasicNode';
import { Schema, SchemaFactory } from './Schema';

import type { Encoding } from './Encoding';
import type { Example } from './Example';
import type { Parameter } from './Parameter';
import type { RequestBody } from './RequestBody';
import type { Response } from './Response';
import type { MediaTypeModel } from './types';
import type { Nullable, JSONValue } from '@fresha/api-tools-core';

export type MediaTypeParent = Parameter | RequestBody | Response;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#media-type-object
 */
export class MediaType extends BasicNode<MediaTypeParent> implements MediaTypeModel {
  schema: Nullable<Schema>;
  example: JSONValue;
  readonly examples: Map<string, Example>;
  readonly encoding: Map<string, Encoding>;

  constructor(parent: MediaTypeParent) {
    super(parent);
    this.schema = null;
    this.example = null;
    this.examples = new Map<string, Example>();
    this.encoding = new Map<string, Encoding>();
  }

  setSchema(type: SchemaType): Schema {
    const result = SchemaFactory.create(this, type) as Schema;
    this.schema = result;
    return result;
  }

  deleteSchema(): void {
    this.schema = null;
  }
}

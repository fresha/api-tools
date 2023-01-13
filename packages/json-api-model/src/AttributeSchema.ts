import type { JSONAPIAttributeSchema, JSONAPIResourceSchema } from './types';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class AttributeSchema implements JSONAPIAttributeSchema {
  readonly resource: JSONAPIResourceSchema;
  readonly name: string;
  readonly #schema: SchemaModel;

  constructor(resource: JSONAPIResourceSchema, name: string, schema: SchemaModel) {
    this.resource = resource;
    this.name = name;
    this.#schema = schema;
  }

  get schema(): SchemaModel {
    return this.#schema;
  }
}

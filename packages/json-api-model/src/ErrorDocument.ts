import type { DocumentId, JSONAPIErrorDocumentSchema, JSONAPISchemaRegistry } from './types';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class ErrorDocument implements JSONAPIErrorDocumentSchema {
  readonly #registry: JSONAPISchemaRegistry;
  readonly #id: DocumentId;
  readonly #schema: SchemaModel;

  constructor(registry: JSONAPISchemaRegistry, id: DocumentId, schema: SchemaModel) {
    this.#registry = registry;
    this.#id = id;
    this.#schema = schema;
  }

  get registry(): JSONAPISchemaRegistry {
    return this.#registry;
  }

  get id(): string {
    return this.#id;
  }

  get schema(): SchemaModel {
    return this.#schema;
  }
}

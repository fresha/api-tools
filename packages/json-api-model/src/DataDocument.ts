import type {
  DocumentId,
  JSONAPIDataDocumentSchema,
  JSONAPIResourceSchema,
  JSONAPISchemaRegistry,
} from './types';
import type { JSONObject, Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class DataDocument implements JSONAPIDataDocumentSchema {
  readonly #registry: JSONAPISchemaRegistry;
  readonly #id: DocumentId;
  readonly #schema: SchemaModel;

  readonly #data: JSONAPIResourceSchema[];
  readonly #included: JSONAPIResourceSchema[];
  readonly #meta: Nullable<JSONObject>;

  constructor(registry: JSONAPISchemaRegistry, id: DocumentId, schema: SchemaModel) {
    this.#registry = registry;
    this.#id = id;
    this.#schema = schema;

    this.#data = [];
    this.#included = [];
    this.#meta = null;

    this.parseResources();
  }

  get registry(): JSONAPISchemaRegistry {
    return this.#registry;
  }

  get id(): string {
    return this.#id;
  }

  get data(): JSONAPIResourceSchema[] {
    return this.#data;
  }

  get included(): JSONAPIResourceSchema[] {
    return this.#included;
  }

  get meta(): Nullable<JSONObject> {
    return this.#meta;
  }

  protected parseResources(): void {
    const data = this.#schema.getPropertyOrThrow('data');
    if (data.type === 'object') {
      this.#registry.addResourceSchema(data);
    } else if (data.type === 'array') {
      const items = data.getPropertyOrThrow('items');
      if (items.type === 'object') {
        this.#registry.addResourceSchema(items);
      }
    }
  }

  get schema(): SchemaModel {
    return this.#schema;
  }
}

import type { DocumentId, DataDocumentModel, ResourceModel, RegistryModel } from './types';
import type { JSONObject, Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class DataDocument implements DataDocumentModel {
  readonly registry: RegistryModel;
  readonly schema: SchemaModel;
  readonly id: DocumentId;

  data: ResourceModel | ResourceModel[];
  included: ResourceModel[];
  meta: Nullable<JSONObject>;

  constructor(registry: RegistryModel, id: DocumentId, schema: SchemaModel) {
    this.registry = registry;
    this.id = id;
    this.schema = schema;

    this.data = [];
    this.included = [];
    this.meta = null;

    this.parseResources();
  }

  protected parseResources(): void {
    const data = this.schema.getPropertyOrThrow('data');
    if (data.type === 'object') {
      this.registry.parseResource(data);
    } else if (data.type === 'array') {
      const items = data.getPropertyOrThrow('items');
      if (items.type === 'object') {
        this.registry.parseResource(items);
      }
    }
  }

  jsonSchema(): SchemaModel {
    return this.schema;
  }
}

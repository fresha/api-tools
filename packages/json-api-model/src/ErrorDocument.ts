import type { DocumentId, ErrorDocumentModel, RegistryModel } from './types';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class ErrorDocument implements ErrorDocumentModel {
  readonly registry: RegistryModel;
  readonly id: DocumentId;
  readonly schema: SchemaModel;

  constructor(registry: RegistryModel, id: DocumentId, schema: SchemaModel) {
    this.registry = registry;
    this.id = id;
    this.schema = schema;
  }

  jsonSchema(): SchemaModel {
    return this.schema;
  }
}

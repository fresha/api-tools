import type { AttributeModel, ResourceModel } from './types';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class Attribute implements AttributeModel {
  readonly resource: ResourceModel;
  readonly name: string;
  private readonly schema: SchemaModel;

  constructor(resource: ResourceModel, name: string, schema: SchemaModel) {
    this.resource = resource;
    this.name = name;
    this.schema = schema;
  }

  jsonSchema(): SchemaModel {
    return this.schema;
  }
}

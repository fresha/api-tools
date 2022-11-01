import assert from 'assert';

import type { RelationshipModel, ResourceModel } from './types';
import type { Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class Relationship implements RelationshipModel {
  readonly resource: ResourceModel;
  readonly name: string;
  readonly otherResource: Nullable<ResourceModel>;
  readonly otherResourceType: string;
  protected readonly schema: SchemaModel;

  constructor(resource: ResourceModel, name: string, schema: SchemaModel) {
    this.resource = resource;
    this.name = name;
    this.otherResource = null;
    this.schema = schema;

    let x = this.schema.getPropertyOrThrow('data');
    if (x.type === 'array') {
      assert(x.items);
      x = x.items;
    }

    const otherResourceType = x.getPropertyOrThrow('type').enum?.at(0);
    assert(otherResourceType && typeof otherResourceType === 'string');

    this.otherResourceType = otherResourceType;
  }

  jsonSchema(): SchemaModel {
    return this.schema;
  }
}

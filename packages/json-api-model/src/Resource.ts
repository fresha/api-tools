import assert from 'assert';

import { Attribute } from './Attribute';
import { Relationship } from './Relationship';

import type {
  AttributeModel,
  DocumentModel,
  RegistryModel,
  RelationshipModel,
  ResourceModel,
} from './types';
import type { Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class Resource implements ResourceModel {
  readonly registry: RegistryModel | DocumentModel;
  readonly schema: Nullable<SchemaModel>;

  readonly type: string;
  readonly attributes: Map<string, AttributeModel>;
  readonly relationships: Map<string, RelationshipModel>;

  constructor(registry: RegistryModel | DocumentModel, schema: string | SchemaModel) {
    this.registry = registry;

    if (typeof schema === 'string') {
      this.type = schema;
      this.schema = null;
    } else {
      this.schema = schema;
      const resourceType = this.schema.getPropertyDeepOrThrow('type').enum?.at(0);
      assert(resourceType && typeof resourceType === 'string');
      this.type = resourceType;
    }

    this.attributes = new Map<string, AttributeModel>();
    this.relationships = new Map<string, RelationshipModel>();

    if (this.schema) {
      const attributesSchema = this.schema.getPropertyDeepOrThrow('attributes');
      for (const [attrName, attrSchema] of attributesSchema.properties) {
        const attribute = new Attribute(this, attrName, attrSchema);
        this.attributes.set(attrName, attribute);
      }
      const relationshipsSchema = this.schema.getPropertyDeep('relationships');
      if (relationshipsSchema) {
        for (const [relName, relSchema] of relationshipsSchema.properties) {
          const relationship = new Relationship(this, relName, relSchema);
          this.relationships.set(relName, relationship);
        }
      }
    }
  }

  getAttributeNames(): string[] {
    return Array.from(this.attributes.keys());
  }

  getAttribute(name: string): AttributeModel | undefined {
    return this.attributes.get(name);
  }

  getAttributeOrThrow(name: string): AttributeModel {
    const result = this.getAttribute(name);
    assert(result, `Missing attribute "${name}" in resource "${this.type}"`);
    return result;
  }

  getRelationshipNames(): string[] {
    return Array.from(this.relationships.keys());
  }

  getRelationship(name: string): RelationshipModel | undefined {
    return this.relationships.get(name);
  }

  getRelationshipOrThrow(name: string): RelationshipModel {
    const result = this.getRelationship(name);
    assert(result, `Missing relationship "${name}" in resource "${this.type}"`);
    return result;
  }

  jsonSchema(): Nullable<SchemaModel> {
    return this.schema;
  }
}

import assert from 'assert';

import { Nullable, titleCase } from '@fresha/api-tools-core';
import pluralize from 'pluralize';

import { AttributeSchema } from './AttributeSchema';
import { parseRelationshipSchema, Relationship } from './RelationshipSchema';

import type {
  JSONAPIAttributeSchema,
  JSONAPISchemaRegistry,
  JSONAPIRelationshipSchema,
  JSONAPIResourceSchema,
  RelationshipCardinality,
} from './types';
import type { SchemaModel, CreateSchemaPropertyOptions } from '@fresha/openapi-model/build/3.0.3';

const isSchemaModel = (obj: CreateSchemaPropertyOptions): obj is SchemaModel => {
  return (
    !!obj &&
    typeof obj === 'object' &&
    'isComposite' in obj &&
    typeof obj.isComposite === 'function'
  );
};

export class ResourceSchema implements JSONAPIResourceSchema {
  #registry: JSONAPISchemaRegistry;
  #type: string;
  #attributes: Map<string, JSONAPIAttributeSchema>;
  #relationships: Map<string, JSONAPIRelationshipSchema>;

  #schemaTitle: string;
  #idSchemaTitle: string;

  #schema: Nullable<SchemaModel>;
  #attributesSchema: Nullable<SchemaModel>;
  #relationshipsSchema: Nullable<SchemaModel>;

  #idSchema: SchemaModel;
  #relationship0Schema: Nullable<SchemaModel>;
  #relationship1Schema: Nullable<SchemaModel>;
  #relationshipNSchema: Nullable<SchemaModel>;

  constructor(
    registry: JSONAPISchemaRegistry,
    resourceTypeOrSchema: string | SchemaModel,
    title?: string,
  ) {
    this.#registry = registry;
    this.#attributes = new Map<string, JSONAPIAttributeSchema>();
    this.#relationships = new Map<string, JSONAPIRelationshipSchema>();

    if (typeof resourceTypeOrSchema === 'string') {
      this.#type = resourceTypeOrSchema;
      this.#schemaTitle = title ?? `${titleCase(pluralize.singular(this.#type))}Resource`;
      this.#idSchemaTitle = `${this.#schemaTitle}ID`;

      this.#idSchema = this.#registry.openapi.components.setSchema(this.#idSchemaTitle, 'object');
      this.#idSchema.setProperties({
        type: { type: 'string', enum: [this.#type], required: true },
        id: { type: 'string', required: true, minLength: 1 },
      });

      this.#schema = null;
      this.#attributesSchema = null;
      this.#relationshipsSchema = null;
    } else {
      assert(
        !title || title !== resourceTypeOrSchema.title,
        'When created from SchemaModel, the title cannot be passed',
      );

      this.#schema = resourceTypeOrSchema;

      const resourceType = this.#schema.getPropertyDeepOrThrow('type').enum?.at(0);
      assert(resourceType && typeof resourceType === 'string');
      this.#type = resourceType;

      this.#schemaTitle =
        this.#schema.title ?? `${titleCase(pluralize.singular(this.#type))}Resource`;
      this.#schema.title = this.#schemaTitle;

      this.#idSchemaTitle = `${this.#schemaTitle}ID`;

      this.#attributesSchema = this.#schema.getPropertyDeepOrThrow('attributes');
      for (const [attrName, attrSchema] of this.#attributesSchema.properties) {
        const attribute = new AttributeSchema(this, attrName, attrSchema);
        this.#attributes.set(attrName, attribute);
      }

      this.#relationshipsSchema = this.#schema.getPropertyDeep('relationships') ?? null;
      if (this.#relationshipsSchema) {
        for (const [relName, relSchema] of this.#relationshipsSchema.properties) {
          const { resourceType: otherResourceType, cardinality } =
            parseRelationshipSchema(relSchema);

          const relationship = new Relationship(this, relName, otherResourceType, cardinality);
          this.#relationships.set(relName, relationship);
        }
      }

      this.#idSchema = this.#registry.openapi.components.setSchema(this.#idSchemaTitle, 'object');
      this.#idSchema.setProperties({
        type: { type: 'string', enum: [this.#type], required: true },
        id: { type: 'string', required: true, minLength: 1 },
      });
    }

    this.#relationship0Schema = null;
    this.#relationship1Schema = null;
    this.#relationshipNSchema = null;
  }

  get registry(): JSONAPISchemaRegistry {
    return this.#registry;
  }

  get type(): string {
    return this.#type;
  }

  attributeSchemas(): IterableIterator<JSONAPIAttributeSchema> {
    return this.#attributes.values();
  }

  hasAttributes(): boolean {
    return !!this.#attributes.size;
  }

  getAttributeNames(): string[] {
    return Array.from(this.#attributes.keys());
  }

  getAttribute(name: string): JSONAPIAttributeSchema | undefined {
    return this.#attributes.get(name);
  }

  getAttributeOrThrow(name: string): JSONAPIAttributeSchema {
    const result = this.getAttribute(name);
    assert(result, `Missing attribute "${name}" in resource "${this.type}"`);
    return result;
  }

  private initSchema(): void {
    assert(this.#schema == null, 'Schema has already been initialized');
    assert(this.#attributesSchema == null, 'Attributes schema has already been initialized');
    assert(this.#relationshipsSchema == null, 'Relationships schema has already been initialized');

    this.#schema = this.#registry.openapi.components.setSchema(this.#schemaTitle);
    this.#schema.addAllOf(this.#idSchema);
    const bodySchema = this.#schema.addAllOf('object');
    this.#attributesSchema = bodySchema.setProperty('attributes', 'object');
    this.#relationshipsSchema = null;
  }

  addAttribute(name: string, options: CreateSchemaPropertyOptions): JSONAPIAttributeSchema {
    assert(!this.#attributes.has(name), `Attribute '${name}' already exists`);

    if (!this.#schema) {
      this.initSchema();
    }

    assert(this.#attributesSchema);

    const result = new AttributeSchema(
      this,
      name,
      isSchemaModel(options) ? options : this.#attributesSchema.setProperty(name, options),
    );
    this.#attributes.set(name, result);
    return result;
  }

  addAttributes(attrs: Record<string, CreateSchemaPropertyOptions>): JSONAPIResourceSchema {
    for (const [name, options] of Object.entries(attrs)) {
      this.addAttribute(name, options);
    }
    return this;
  }

  deleteAttribute(name: string): void {
    this.#attributes.delete(name);
  }

  clearAttributes(): void {
    this.#attributes.clear();
  }

  relationshipSchemas(): IterableIterator<JSONAPIRelationshipSchema> {
    return this.#relationships.values();
  }

  hasRelationships(): boolean {
    return !!this.#relationships.size;
  }

  getRelationshipNames(): string[] {
    return Array.from(this.#relationships.keys());
  }

  getRelationship(name: string): JSONAPIRelationshipSchema | undefined {
    return this.#relationships.get(name);
  }

  getRelationshipOrThrow(name: string): JSONAPIRelationshipSchema {
    const result = this.getRelationship(name);
    assert(result, `Missing relationship "${name}" in resource "${this.type}"`);
    return result;
  }

  addRelationship(
    name: string,
    resourceType: string,
    cardinality: RelationshipCardinality,
  ): JSONAPIRelationshipSchema {
    assert(!this.#relationships.has(name), `Relationship named '${name}' already exists`);

    if (!this.#schema) {
      this.initSchema();
    }

    const result = new Relationship(this, name, resourceType, cardinality);
    this.#relationships.set(name, result);
    return result;
  }

  deleteRelationship(name: string): void {
    this.#relationships.delete(name);
  }

  clearRelationships(): void {
    this.#relationships.clear();
  }

  get schema(): Nullable<SchemaModel> {
    return this.#schema;
  }

  get idSchema(): SchemaModel {
    return this.#idSchema;
  }

  // eslint-disable-next-line consistent-return
  relationshipSchema(cardinality: RelationshipCardinality): SchemaModel {
    assert(this.#schema);

    const title = this.#schema.title!;
    assert(title, `Resource schema must have non-empty title ${title}`);
    switch (cardinality) {
      case 'zero-or-one':
        if (this.#relationship0Schema == null) {
          this.#relationship0Schema = this.#registry.openapi.components.setSchema(
            `${title}Relationship0`,
            'object',
          );
        }
        return this.#relationship0Schema;
      case 'one':
        if (this.#relationship1Schema == null) {
          this.#relationship1Schema = this.#registry.openapi.components.setSchema(
            `${title}Relationship1`,
            'object',
          );
        }
        return this.#relationship1Schema;
      case 'many':
        if (this.#relationshipNSchema == null) {
          this.#relationshipNSchema = this.#registry.openapi.components.setSchema(
            `${title}RelationshipN`,
            'object',
          );
        }
        return this.#relationshipNSchema;
      default:
        assert.fail('Unsupported cardinality');
    }
  }
}

import type { JSONObject, Nullable } from '@fresha/api-tools-core';
import type {
  SchemaCreateOptions,
  SchemaModel,
  OpenAPIModel,
} from '@fresha/openapi-model/build/3.0.3';

/**
 * @see https://jsonapi.org/format/#introduction
 */
export type JSONAPIMediaType = 'application/vnd.api+json';

/**
 * Identifies document schemas within a repository.
 */
export type DocumentId = string;

export type JSONAPIDocumentSchemaType = 'client' | 'data' | 'error';

/**
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface JSONAPIDataDocumentSchema {
  readonly id: string;
  readonly data: JSONAPIResourceSchema | ReadonlyArray<JSONAPIResourceSchema>;
  readonly included: ReadonlyArray<JSONAPIResourceSchema>;
  readonly meta: Nullable<JSONObject>;

  /**
   * Returns JSON Schema model for this document.
   */
  readonly schema: SchemaModel;
}

/**
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface JSONAPIErrorDocumentSchema {
  /**
   * Returns JSON Schema model for this document.
   */
  readonly schema: SchemaModel;
}

/**
 * @see https://jsonapi.org/format/#document-structure
 */
export type DocumentModel = JSONAPIDataDocumentSchema | JSONAPIErrorDocumentSchema;

/**
 * @see https://jsonapi.org/format/#document-resource-object-attributes
 */
export interface JSONAPIAttributeSchema {
  readonly resource: JSONAPIResourceSchema;
  readonly name: string;

  /**
   * Returns JSON Schema model for this attribute.
   */
  readonly schema: SchemaModel;
}

/**
 * @see https://jsonapi.org/format/#document-resource-object-relationships
 */
export interface JSONAPIRelationshipSchema {
  readonly resource: JSONAPIResourceSchema;
  readonly name: string;
  readonly resourceType: string;
  readonly otherResource: JSONAPIResourceSchema;
  readonly cardinality: RelationshipCardinality;

  /**
   * Returns JSON Schema model for this relationship.
   */
  readonly schema: SchemaModel;
}

export type RelationshipCardinality = 'zero-or-one' | 'one' | 'many';

/**
 * @see https://jsonapi.org/format/#document-resource-objects
 */
export interface JSONAPIResourceSchema {
  readonly registry: JSONAPISchemaRegistry;
  readonly type: string;

  attributeSchemas(): IterableIterator<JSONAPIAttributeSchema>;

  hasAttributes(): boolean;
  getAttributeNames(): string[];
  getAttribute(name: string): JSONAPIAttributeSchema | undefined;
  getAttributeOrThrow(name: string): JSONAPIAttributeSchema;
  addAttribute(name: string, options: SchemaCreateOptions): JSONAPIAttributeSchema;
  addAttributes(attrs: Record<string, SchemaCreateOptions>): JSONAPIResourceSchema;
  deleteAttribute(name: string): void;
  clearAttributes(): void;

  relationshipSchemas(): IterableIterator<JSONAPIRelationshipSchema>;

  hasRelationships(): boolean;
  getRelationshipNames(): string[];
  getRelationship(name: string): JSONAPIRelationshipSchema | undefined;
  getRelationshipOrThrow(name: string): JSONAPIRelationshipSchema;
  addRelationship(
    name: string,
    resourceType: string,
    cardinality: RelationshipCardinality,
  ): JSONAPIRelationshipSchema;
  deleteRelationship(name: string): void;
  clearRelationships(): void;

  /**
   * Returns JSON Schema describing shape of this resource's data.
   * Note that this field may be null, which means we know only resource type,
   * but neither its attributes nor relationships.
   */
  readonly schema: Nullable<SchemaModel>;

  /**
   * Returns JSON Schema object representing this resource's identifier
   */
  readonly idSchema: SchemaModel;

  /**
   * Returns a JSON schema object representing a relationship to this resource,
   * with given cardinality.
   *
   * @param cardinality relationship cardinality
   */
  relationshipSchema(cardinality: RelationshipCardinality): SchemaModel;
}

/**
 * Manages JSON:API resource schemas.
 */
export interface JSONAPISchemaRegistry {
  readonly openapi: OpenAPIModel;

  resourceSchemas(): IterableIterator<JSONAPIResourceSchema>;

  hasResources(): boolean;
  getResourceTypes(): string[];
  getResourceSchema(resourceType: string): JSONAPIResourceSchema | undefined;
  getResourceSchemaOrThrow(resourceType: string): JSONAPIResourceSchema;
  addResourceSchema(schema: SchemaModel): JSONAPIResourceSchema;
  addResourceSchema(resourceType: string, title?: string): JSONAPIResourceSchema;
  deleteResourceSchema(resourceType: string): void;
  clearResourceSchemas(): void;

  documentSchemas(): IterableIterator<DocumentModel>;

  hasDocuments(): boolean;
  getDocumentIds(): string[];
  getDocumentSchema(documentId: DocumentId): DocumentModel | undefined;
  getDocumentSchemaOrThrow(documentId: DocumentId): DocumentModel;
  addDocumentSchema(
    documentId: DocumentId,
    schemaOrType: JSONAPIDocumentSchemaType | SchemaModel,
  ): DocumentModel;
  deleteDocumentSchema(documentId: DocumentId): void;
  clearDocumentSchemas(): void;
}

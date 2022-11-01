import type { JSONObject, Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

/**
 * @see https://jsonapi.org/format/#introduction
 */
export type JSONAPIMediaType = 'application/vnd.api+json';

/**
 * @see https://jsonapi.org/format/#document-resource-object-identification
 */
export type ResourceType = string;

/**
 * Identifies document schemas within a repository.
 */
export type DocumentId = string;

/**
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface DataDocumentModel {
  readonly data: ResourceModel | ReadonlyArray<ResourceModel>;
  readonly included: ReadonlyArray<ResourceModel>;
  readonly meta: Nullable<JSONObject>;

  /**
   * Returns JSON Schema model for this document.
   */
  jsonSchema(): SchemaModel;
}

/**
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface ErrorDocumentModel {
  /**
   * Returns JSON Schema model for this document.
   */
  jsonSchema(): SchemaModel;
}

/**
 * @see https://jsonapi.org/format/#document-structure
 */
export type DocumentModel = DataDocumentModel | ErrorDocumentModel;

/**
 * @see https://jsonapi.org/format/#document-resource-object-attributes
 */
export interface AttributeModel {
  readonly resource: ResourceModel;
  readonly name: string;

  /**
   * Returns JSON Schema model for this attribute.
   */
  jsonSchema(): SchemaModel;
}

/**
 * @see https://jsonapi.org/format/#document-resource-object-relationships
 */
export interface RelationshipModel {
  readonly name: string;
  readonly otherResourceType: string;
  readonly otherResource: Nullable<ResourceModel>;

  /**
   * Returns JSON Schema model for this relationship.
   */
  jsonSchema(): SchemaModel;
}

/**
 * @see https://jsonapi.org/format/#document-resource-objects
 */
export interface ResourceModel {
  readonly type: ResourceType;
  readonly attributes: ReadonlyMap<string, AttributeModel>;
  readonly relationships: ReadonlyMap<string, RelationshipModel>;

  getAttributeNames(): string[];
  getAttribute(name: string): AttributeModel | undefined;
  getAttributeOrThrow(name: string): AttributeModel;

  getRelationshipNames(): string[];
  getRelationship(name: string): RelationshipModel | undefined;
  getRelationshipOrThrow(name: string): RelationshipModel;

  /**
   * Returns JSON Schema describing shape of this resource's data.
   */
  jsonSchema(): Nullable<SchemaModel>;
}

/**
 * Manages JSON:API resources.
 */
export interface RegistryModel {
  readonly resources: ReadonlyMap<ResourceType, ResourceModel>;

  getResource(resourceType: ResourceType): ResourceModel | undefined;
  getResourceOrThrow(resourceType: ResourceType): ResourceModel;

  createResource(type: string): ResourceModel;
  parseResource(schema: SchemaModel): ResourceModel;

  readonly documents: ReadonlyMap<DocumentId, DocumentModel>;

  getDocument(documentId: DocumentId): DocumentModel | undefined;
  getDocumentOrThrow(documentId: DocumentId): DocumentModel;

  parseDocument(schema: SchemaModel, documentId: DocumentId): DocumentModel;
}

import type { JSONObject, Nullable } from '@fresha/api-tools-core';
import type {
  AddBooleanPropertyOptions,
  AddNumberPropertyOptions,
  AddStringPropertyOptions,
  ISchemaRegistry,
  JSONSchema,
} from '@fresha/json-schema-model';

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
export interface IDataDocument {
  readonly id: DocumentId;
  readonly data: IResource | ReadonlyArray<IResource>;
  readonly included: ReadonlyArray<IResource>;
  readonly meta: Nullable<JSONObject>;

  /**
   * Returns JSON Schema model for this document.
   */
  jsonSchema(): JSONSchema;
}

/**
 * @see https://jsonapi.org/format/#error-objects
 */
export interface IErrorObject {
  id: string;
}

/**
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface IErrorDocument {
  readonly id: DocumentId;
  readonly errors: ReadonlyArray<IErrorObject>;

  /**
   * Returns JSON Schema model for this document.
   */
  jsonSchema(): JSONSchema;
}

/**
 * @see https://jsonapi.org/format/#document-structure
 */
export type IDocument = IDataDocument | IErrorDocument;

/**
 * @see https://jsonapi.org/format/#document-resource-object-attributes
 */
export interface IAttribute {
  /**
   * Returns JSON Schema model for this attribute.
   */
  jsonSchema(): JSONSchema;
}

export type RelationshipType = 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';

/**
 * @see https://jsonapi.org/format/#document-resource-object-relationships
 */
export interface IRelationship {
  // source: IResource;
  // sourceName: string;
  // destination: IResource;
  // destinationName: string;
  minCardinality: number;
  maxCardinality: number;
}

export type AddRelationshipOptions = Partial<{
  type: RelationshipType;
}>;

/**
 * @see https://jsonapi.org/format/#document-resource-objects
 */
export interface IResource {
  readonly type: ResourceType;
  readonly id: IAttribute;
  readonly attributes: ReadonlyMap<string, IAttribute>;

  addAttribute(name: string, type: 'boolean', options?: AddBooleanPropertyOptions): IAttribute;
  addAttribute(name: string, type: 'number', options?: AddNumberPropertyOptions): IAttribute;
  addAttribute(name: string, type: 'string', options?: AddStringPropertyOptions): IAttribute;
  addAttribute(name: string, type: 'object'): IAttribute;
  addAttribute(name: string, type: 'array'): IAttribute;
  removeAttribute(name: string): void;
  clearAttributes(): void;

  readonly relationships: ReadonlyMap<string, IRelationship>;

  addRelationship(
    name: string,
    other: IResource,
    otherName: string,
    options?: AddRelationshipOptions,
  ): IRelationship;
  removeRelationship(name: string): void;
  clearRelationships(): void;

  /**
   * Returns JSON Schema describing shape of this resource's data.
   */
  jsonSchema(): JSONSchema;
}

/**
 * Manages JSON:API resources.
 */
export interface IRegistry {
  readonly schemaRegistry: ISchemaRegistry;

  readonly resources: ReadonlyMap<ResourceType, IResource>;

  addResource(type: ResourceType): IResource;
  deleteResource(type: ResourceType): void;
  clearResources(): void;

  readonly documents: ReadonlyMap<DocumentId, IDocument>;

  addDataDocument(id: DocumentId): IDataDocument;
  addErrorDocument(id: DocumentId): IErrorDocument;
  deleteDocument(id: DocumentId): void;
  clearDocuments(): void;
}

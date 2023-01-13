import assert from 'assert';

import { OpenAPIFactory, OpenAPIModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

import { DataDocument } from './DataDocument';
import { ErrorDocument } from './ErrorDocument';
import { ResourceSchema } from './ResourceSchema';

import type {
  DocumentId,
  DocumentModel,
  JSONAPIDocumentSchemaType,
  JSONAPISchemaRegistry,
  JSONAPIResourceSchema,
} from './types';

export class SchemaRegistry implements JSONAPISchemaRegistry {
  readonly #openapi: OpenAPIModel;
  readonly #resources: Map<string, JSONAPIResourceSchema>;
  readonly #documents: Map<DocumentId, DocumentModel>;

  constructor(openapi?: OpenAPIModel) {
    this.#openapi = openapi ?? OpenAPIFactory.create();
    this.#resources = new Map<string, JSONAPIResourceSchema>();
    this.#documents = new Map<DocumentId, DocumentModel>();
  }

  get openapi(): OpenAPIModel {
    return this.#openapi;
  }

  resourceSchemas(): IterableIterator<JSONAPIResourceSchema> {
    return this.#resources.values();
  }

  hasResources(): boolean {
    return !!this.#resources.size;
  }

  getResourceTypes(): string[] {
    return Array.from(this.#resources.keys());
  }

  getResourceSchema(resourceType: string): JSONAPIResourceSchema | undefined {
    return this.#resources.get(resourceType);
  }

  getResourceSchemaOrThrow(resourceType: string): JSONAPIResourceSchema {
    const result = this.getResourceSchema(resourceType);
    assert(result, `Expected resource of type "${resourceType}" to exist`);
    return result;
  }

  addResourceSchema(schema: SchemaModel): JSONAPIResourceSchema;
  addResourceSchema(resourceType: string, title?: string): JSONAPIResourceSchema;

  addResourceSchema(
    resourceTypeOrSchema: string | SchemaModel,
    title?: string,
  ): JSONAPIResourceSchema {
    if (typeof resourceTypeOrSchema === 'string') {
      assert(
        !this.#resources.has(resourceTypeOrSchema),
        `Duplicate resource schema for type '${resourceTypeOrSchema}'`,
      );
      const resource = new ResourceSchema(this, resourceTypeOrSchema, title);
      this.#resources.set(resourceTypeOrSchema, resource);
      return resource;
    }
    assert(title === undefined, `When given a schema model, title must not be provided`);
    const typeAttr = resourceTypeOrSchema.getPropertyDeepOrThrow('type');
    assert(typeAttr.enum?.length === 1, `Resource schemas must have a single enum value`);
    const resourceType = typeAttr.enum[0];
    assert(
      resourceType && typeof resourceType === 'string',
      'Resource types must be non-empty strings',
    );
    const result = new ResourceSchema(this, resourceTypeOrSchema);
    this.#resources.set(resourceType, result);
    return result;
  }

  deleteResourceSchema(type: string): void {
    this.#resources.delete(type);
  }

  clearResourceSchemas(): void {
    this.#resources.clear();
  }

  documentSchemas(): IterableIterator<DocumentModel> {
    return this.#documents.values();
  }

  hasDocuments(): boolean {
    return !!this.#documents.size;
  }

  getDocumentIds(): string[] {
    return Array.from(this.#documents.keys());
  }

  getDocumentSchema(documentId: DocumentId): DocumentModel | undefined {
    return this.#documents.get(documentId);
  }

  getDocumentSchemaOrThrow(documentId: DocumentId): DocumentModel {
    const result = this.getDocumentSchema(documentId);
    assert(result, `Expected to find document for ID "${documentId}"`);
    return result;
  }

  addDocumentSchema(
    documentId: DocumentId,
    schemaOrType: JSONAPIDocumentSchemaType | SchemaModel,
  ): DocumentModel {
    assert(
      !this.#documents.has(documentId),
      `Document schema with ID '${documentId}' already exists`,
    );

    let result: DocumentModel;
    if (schemaOrType === 'data' || schemaOrType === 'client') {
      const schema = this.#openapi.components.setSchema(documentId);
      result = new DataDocument(this, documentId, schema);
    } else if (schemaOrType === 'error') {
      const schema = this.#openapi.components.setSchema(documentId);
      result = new ErrorDocument(this, documentId, schema);
    } else if (schemaOrType instanceof Object) {
      assert(schemaOrType.type === 'object', 'Document schemas must have type "object"');

      const dataAttr = schemaOrType.getProperty('data');
      if (dataAttr) {
        const result2 = new DataDocument(this, documentId, schemaOrType);
        this.#documents.set(documentId, result2);
        return result2;
      }

      const result2 = new ErrorDocument(this, documentId, schemaOrType);
      this.#documents.set(documentId, result2);
      return result2;
    } else {
      assert.fail(`Unsupported schema type '${String(schemaOrType)}'`);
    }

    this.#documents.set(documentId, result);

    return result;
  }

  deleteDocumentSchema(documentId: string): void {
    this.#documents.delete(documentId);
  }

  clearDocumentSchemas(): void {
    this.#documents.clear();
  }
}

export const createJSONAPISchemaRegistry = (): JSONAPISchemaRegistry => new SchemaRegistry();

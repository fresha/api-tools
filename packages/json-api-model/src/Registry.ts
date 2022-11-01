import assert from 'assert';

import { DataDocument } from './DataDocument';
import { ErrorDocument } from './ErrorDocument';
import { Resource } from './Resource';

import type {
  DocumentId,
  DocumentModel,
  RegistryModel,
  ResourceModel,
  ResourceType,
} from './types';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export class Registry implements RegistryModel {
  readonly resources: Map<ResourceType, ResourceModel>;
  readonly documents: Map<DocumentId, DocumentModel>;

  constructor() {
    this.resources = new Map<ResourceType, ResourceModel>();
    this.documents = new Map<DocumentId, DocumentModel>();
  }

  getResource(resourceType: ResourceType): ResourceModel | undefined {
    return this.resources.get(resourceType);
  }

  getResourceOrThrow(resourceType: ResourceType): ResourceModel {
    const result = this.getResource(resourceType);
    assert(result, `Expected resource of type "${resourceType}" to exist`);
    return result;
  }

  createResource(type: string): ResourceModel {
    assert(!this.resources.has(type));

    const resource = new Resource(this, type);
    this.resources.set(type, resource);
    return resource;
  }

  parseResource(schema: SchemaModel): ResourceModel {
    assert(schema.type === 'object', 'Resource schemas must have type "object"');

    const typeAttr = schema.getPropertyOrThrow('type');
    assert(typeAttr.enum?.length === 1, `Resource schemas must have a single enum value`);

    const resourceType = typeAttr.enum[0];
    assert(
      resourceType && typeof resourceType === 'string',
      'Resource types must be non-empty strings',
    );

    const result = new Resource(this, schema);
    this.resources.set(resourceType, result);

    return result;
  }

  getDocument(documentId: DocumentId): DocumentModel | undefined {
    return this.documents.get(documentId);
  }

  getDocumentOrThrow(documentId: DocumentId): DocumentModel {
    const result = this.getDocument(documentId);
    assert(result, `Expected to find document for ID "${documentId}"`);
    return result;
  }

  parseDocument(schema: SchemaModel, documentId: DocumentId): DocumentModel {
    assert(schema.type === 'object', 'Document schemas must have type "object"');

    const dataAttr = schema.getProperty('data');
    if (dataAttr) {
      const result = new DataDocument(this, documentId, schema);
      this.documents.set(documentId, result);
      return result;
    }

    const result = new ErrorDocument(this, documentId, schema);
    this.documents.set(documentId, result);
    return result;
  }
}

export const createRegistry = (): RegistryModel => new Registry();

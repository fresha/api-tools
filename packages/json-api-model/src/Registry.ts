import { ITreeParent } from '@fresha/api-tools-core/build/TreeNode';

import { DataDocument } from './DataDocument';
import { ErrorDocument } from './ErrorDocument';
import { Resource } from './Resource';

import type {
  DocumentId,
  IDataDocument,
  IDocument,
  IErrorDocument,
  IRegistry,
  IResource,
  ResourceType,
} from './types';
import type { ISchemaRegistry } from '@fresha/json-schema-model';

export class Registry implements ITreeParent<IRegistry>, IRegistry {
  readonly schemaRegistry: ISchemaRegistry;
  readonly resources: Map<ResourceType, IResource>;
  readonly documents: Map<DocumentId, IDocument>;

  constructor(schemaRegistry: ISchemaRegistry) {
    this.schemaRegistry = schemaRegistry;
    this.resources = new Map<ResourceType, IResource>();
    this.documents = new Map<DocumentId, IDocument>();
  }

  get root(): IRegistry {
    return this;
  }

  addResource(type: ResourceType): IResource {
    if (this.resources.has(type)) {
      throw new Error(`Duplicate resource type ${type}`);
    }
    const resource = new Resource(this, type);
    this.resources.set(type, resource);
    return resource;
  }

  deleteResource(type: ResourceType): void {
    this.resources.delete(type);
  }

  clearResources(): void {
    this.resources.clear();
  }

  addDataDocument(id: DocumentId): IDataDocument {
    if (this.documents.has(id)) {
      throw new Error(`Duplicate document type ${id}`);
    }
    const result = new DataDocument(this, id);
    this.documents.set(id, result);
    return result;
  }

  addErrorDocument(id: DocumentId): IErrorDocument {
    if (this.documents.has(id)) {
      throw new Error(`Duplicate document type ${id}`);
    }
    const result = new ErrorDocument(this, id);
    this.documents.set(id, result);
    return result;
  }

  deleteDocument(id: DocumentId): void {
    this.documents.delete(id);
  }

  clearDocuments(): void {
    this.documents.clear();
  }
}

export const createRegistry = (schemaRegistry: ISchemaRegistry): IRegistry =>
  new Registry(schemaRegistry);

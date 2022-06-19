import { JSONObject, Nullable, TreeNode } from '@fresha/api-tools-core';
import { JSONSchema } from '@fresha/json-schema-model';

import { Registry } from './Registry';
import { Resource } from './Resource';
import { DocumentId, IDataDocument, IRegistry, IResource } from './types';

type DataDocumentParent = Registry;

export class DataDocument extends TreeNode<IRegistry, DataDocumentParent> implements IDataDocument {
  readonly id: DocumentId;
  data: IResource | readonly IResource[];
  readonly included: IResource[];
  meta: Nullable<JSONObject>;

  constructor(parent: DataDocumentParent, id: DocumentId) {
    super(parent);
    this.id = id;
    this.data = new Resource(this, 'new');
    this.included = [];
    this.meta = null;
  }

  // eslint-disable-next-line class-methods-use-this
  jsonSchema(): JSONSchema {
    throw new Error('Method not implemented');
  }
}

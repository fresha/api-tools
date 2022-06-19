import { TreeNode } from '@fresha/api-tools-core';

import { Registry } from './Registry';

import type { DocumentId, IErrorDocument, IErrorObject, IRegistry } from './types';
import type { JSONSchema } from '@fresha/json-schema-model';

export type ErrorDocumentParent = Registry;

export class ErrorDocument
  extends TreeNode<IRegistry, ErrorDocumentParent>
  implements IErrorDocument
{
  readonly id: string;
  readonly errors: IErrorObject[];

  constructor(parent: ErrorDocumentParent, id: DocumentId) {
    super(parent);
    this.id = id;
    this.errors = [];
  }

  // eslint-disable-next-line class-methods-use-this
  jsonSchema(): JSONSchema {
    throw new Error('Method not implemented.');
  }
}

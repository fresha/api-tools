import { JSONValue, TreeNode } from '@fresha/api-tools-core';
import { ITreeParent } from '@fresha/api-tools-core/build/TreeNode';

import { IReference, ISchemaRegistry, JSONSchema } from './types';

type ReferenceParent = ITreeParent<ISchemaRegistry> | JSONSchema;

export class Reference extends TreeNode<ISchemaRegistry, ReferenceParent> implements IReference {
  ref: string;
  readonly extensionFields: Map<string, JSONValue>;

  constructor(parent: ReferenceParent, ref: string) {
    super(parent);
    this.ref = ref;
    this.extensionFields = new Map<string, JSONValue>();
  }
}

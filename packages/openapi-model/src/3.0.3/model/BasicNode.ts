import type {
  ExtensionFields,
  OpenAPIModel,
  SpecificationExtensionsModel,
  TreeNode,
} from './types';
import type { Disposable, JSONValue } from '@fresha/api-tools-core';

export interface TreeParent {
  readonly root: OpenAPIModel;
}

export class BasicNode<TParent extends TreeParent>
  implements TreeNode<TParent>, Disposable, SpecificationExtensionsModel
{
  readonly root: OpenAPIModel;
  readonly parent: TParent;
  readonly extensions: ExtensionFields;

  constructor(parent: TParent) {
    this.parent = parent;
    this.root = parent.root;
    this.extensions = new Map<string, JSONValue>();
  }

  // eslint-disable-next-line class-methods-use-this
  dispose(): void {}

  setExtension(key: string, value: JSONValue): void {
    this.extensions.set(key, value);
  }

  deleteExtension(key: string): void {
    this.extensions.delete(key);
  }

  clearExtensions(): void {
    this.extensions.clear();
  }
}

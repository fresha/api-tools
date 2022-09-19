import type { OpenAPI } from './OpenAPI';
import type { Disposable, SpecificationExtensionsModel } from './types';
import type { JSONValue } from '@fresha/api-tools-core';

export interface TreeParent {
  root: OpenAPI;
}

export type ExtensionFields = Map<string, JSONValue>;

export class BasicNode<TParent extends TreeParent>
  implements TreeParent, Disposable, SpecificationExtensionsModel
{
  root: OpenAPI;
  parent: TParent;
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

export interface ITreeParent<TRoot> {
  readonly root: TRoot;
}

export class TreeNode<TRoot, TParent extends ITreeParent<TRoot>> {
  readonly root: TRoot;
  readonly parent: TParent;

  constructor(parent: TParent) {
    this.parent = parent;
    this.root = parent.root;
  }
}

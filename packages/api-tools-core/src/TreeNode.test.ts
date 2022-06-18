/* eslint-disable max-classes-per-file */
import { TreeNode } from './TreeNode';

class Root {
  readonly root: Root;

  constructor() {
    this.root = this;
  }
}

class Branch extends TreeNode<Root, Branch | Root> {}
class Leaf extends TreeNode<Root, Branch> {}

describe('parent-child relationships', () => {
  it('should allow iterate up to the root', () => {
    const parent = new Root();

    const branch0 = new Branch(parent);

    const branch1 = new Branch(branch0);
    const branch1Leaf = new Leaf(branch1);
    const branch2 = new Branch(branch1);
    const branch2Leaf = new Leaf(branch2);

    expect(branch1Leaf.parent.parent).toBe(branch0);
    expect(branch2Leaf.parent.parent).toBe(branch1);
  });
});

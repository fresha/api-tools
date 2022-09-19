/* eslint-disable max-classes-per-file */
import { BasicNode } from './BasicNode';
import { OpenAPI } from './OpenAPI';

type BranchParent = OpenAPI | Branch;

class Branch extends BasicNode<BranchParent> {}
class Leaf extends BasicNode<Branch> {}

let parent: OpenAPI;

beforeEach(() => {
  parent = new OpenAPI('BasicNode.test', '0.0.1');
});

describe('parent-child relationships', () => {
  it('should allow iterate up to the root', () => {
    const branch0 = new Branch(parent);

    const branch1 = new Branch(branch0);
    const branch1Leaf = new Leaf(branch1);
    const branch2 = new Branch(branch1);
    const branch2Leaf = new Leaf(branch2);

    expect(branch1Leaf.parent.parent).toBe(branch0);
    expect(branch2Leaf.parent.parent).toBe(branch1);
  });
});

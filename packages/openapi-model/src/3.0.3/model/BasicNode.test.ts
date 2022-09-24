/* eslint-disable max-classes-per-file */
import { BasicNode } from './BasicNode';
import { OpenAPI } from './OpenAPI';

let openapi: OpenAPI;

beforeEach(() => {
  openapi = new OpenAPI('BasicNode.test', '0.0.1');
});

describe('parent-child relationships', () => {
  class Branch extends BasicNode<BranchParent> {}
  class Leaf extends BasicNode<Branch> {}

  type BranchParent = OpenAPI | Branch;

  it('should allow iterate up to the root', () => {
    const branch0 = new Branch(openapi);

    const branch1 = new Branch(branch0);
    const branch1Leaf = new Leaf(branch1);
    const branch2 = new Branch(branch1);
    const branch2Leaf = new Leaf(branch2);

    expect(branch1Leaf.parent.parent).toBe(branch0);
    expect(branch2Leaf.parent.parent).toBe(branch1);
  });
});

test('extensions', () => {
  class Leaf extends BasicNode<OpenAPI> {}

  const leaf = new Leaf(openapi);

  expect(leaf.extensions.size).toBe(0);

  leaf.setExtension('key1', 1);
  leaf.setExtension('key2', null);

  expect(Array.from(leaf.extensions.keys())).toStrictEqual(['key1', 'key2']);

  leaf.deleteExtension('key1');

  expect(leaf.extensions.size).toBe(1);

  leaf.setExtension('key3', {});
  leaf.clearExtensions();

  expect(Array.from(leaf.extensions.keys())).toStrictEqual([]);
});

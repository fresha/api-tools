import { OpenAPIFactory } from './OpenAPI';
import { XMLModelParent } from './types';

let parent: XMLModelParent;

beforeEach(() => {
  parent = OpenAPIFactory.create().components.setSchema('ParentSchema');
});

test('basic logic', () => {
  const xml = parent.setXML();

  expect(xml).toHaveProperty('name', null);
  expect(xml).toHaveProperty('namespace', null);
  expect(xml).toHaveProperty('prefix', null);
  expect(xml).toHaveProperty('attribute', false);
  expect(xml).toHaveProperty('wrapped', false);
});

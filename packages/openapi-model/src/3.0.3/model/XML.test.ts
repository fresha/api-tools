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

test('mutations', () => {
  const xml = parent.setXML();

  xml.name = 'name2';
  xml.namespace = 'namespace2';
  xml.prefix = 'prefix2';
  xml.attribute = true;
  xml.wrapped = true;

  expect(xml).toHaveProperty('name', 'name2');
  expect(xml).toHaveProperty('namespace', 'namespace2');
  expect(xml).toHaveProperty('prefix', 'prefix2');
  expect(xml).toHaveProperty('attribute', true);
  expect(xml).toHaveProperty('wrapped', true);
});

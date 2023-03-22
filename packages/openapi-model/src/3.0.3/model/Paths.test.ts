import { OpenAPIFactory } from './OpenAPI';
import { PathItem } from './PathItem';

import type { Paths } from './Paths';

let paths: Paths;

beforeEach(() => {
  paths = OpenAPIFactory.create().paths as Paths;
});

test('querying', () => {
  const item1 = paths.root.setPathItem('/people');
  const item2 = paths.root.setPathItem('/pets');

  expect(paths.pathItemCount).toBe(2);
  expect([...paths.pathItemUrls()]).toStrictEqual(['/people', '/pets']);
  expect([...paths.pathItems()]).toStrictEqual([
    ['/people', item1],
    ['/pets', item2],
  ]);
  expect(paths.hasPathItem('/people')).toBe(true);
  expect(paths.hasPathItem('/wizards')).toBe(false);
  expect(paths.getItem('/people')).toBe(item1);
  expect(paths.getItem('/wizards')).toBeUndefined();
  expect(paths.getItemOrThrow('/pets')).toBe(item2);
  expect(() => paths.getItemOrThrow('/monsters')).toThrow();
});

test('getItemUrl() + getItemUrlOrThrow()', () => {
  const openapi1 = paths.root;
  const item1 = openapi1.setPathItem('/hello');
  const item2 = openapi1.setPathItem('/world/{id}');

  const openapi2 = OpenAPIFactory.create();
  const item3 = openapi2.setPathItem('/hello');

  expect(openapi1.paths.getItemUrl(item1)).toBe('/hello');
  expect(openapi1.paths.getItemUrl(item2)).toBe('/world/{id}');
  expect(openapi1.paths.getItemUrl(item3)).toBeUndefined();

  expect(openapi2.paths.getItemUrl(item1)).toBeUndefined();
  expect(() => openapi2.paths.getItemUrlOrThrow(item2)).toThrow();
  expect(openapi2.paths.getItemUrlOrThrow(item3)).toBe('/hello');
});

test('getItemUrl() + mutations', () => {
  const item = paths.root.setPathItem('/hello') as PathItem;
  paths.root.deletePathItem('/hello');
  expect(paths.getItemUrl(item)).toBeUndefined();
});

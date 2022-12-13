import { OpenAPIFactory } from './OpenAPI';

let { paths } = OpenAPIFactory.create();

beforeEach(() => {
  paths = OpenAPIFactory.create().paths;
});

test('getItem + getItemOrThrow', () => {
  paths.root.setPathItem('/people');
  paths.root.setPathItem('/pets');

  expect(paths.getItem('/people')).not.toBeUndefined();
  expect(paths.getItem('/wizards')).toBeUndefined();
  expect(paths.getItemOrThrow('/pets')).not.toBeUndefined();
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
  const item = paths.root.setPathItem('/hello');
  paths.root.deletePathItem('/hello');
  expect(paths.getItemUrl(item)).toBeUndefined();
});

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

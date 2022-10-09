import { OpenAPIFactory } from './OpenAPI';

let callback = OpenAPIFactory.create().components.setCallback('onData');

beforeEach(() => {
  callback = OpenAPIFactory.create().components.setCallback('onData');
});

test('getPathItem + getPathItemOrThrow', () => {
  callback.setPathItem('people');
  callback.setPathItem('pets');

  expect(callback.getPathItem('people')).not.toBeUndefined();
  expect(callback.getPathItem('wizards')).toBeUndefined();
  expect(callback.getPathItemOrThrow('pets')).not.toBeUndefined();
  expect(() => callback.getPathItemOrThrow('monsters')).toThrow();
});

test('mutation methods', () => {
  expect(callback.paths.size).toBe(0);

  callback.setPathItem('warlock');
  callback.setPathItem('amazons');

  expect(Array.from(callback.paths.keys())).toStrictEqual(['warlock', 'amazons']);

  callback.deletePathItem('warlock');

  expect(Array.from(callback.paths.keys())).toStrictEqual(['amazons']);

  callback.clearPathItems();

  expect(callback.paths.size).toBe(0);
});

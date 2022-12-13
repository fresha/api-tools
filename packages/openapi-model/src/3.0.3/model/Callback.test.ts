import { OpenAPIFactory } from './OpenAPI';

let callback = OpenAPIFactory.create().components.setCallback('onData');

beforeEach(() => {
  callback = OpenAPIFactory.create().components.setCallback('onData');
});

test('getPathUrl() + getPathUrlOrThrow()', () => {
  const item1 = callback.setPathItem('hello');

  const callback2 = callback.root.components.setCallback('onResult');
  const item2 = callback2.setPathItem('hello');

  expect(callback.getItemUrl(item1)).toBe('hello');
  expect(callback.getItemUrl(item2)).toBeUndefined();

  expect(() => callback2.getItemUrlOrThrow(item1)).toThrow();
  expect(callback2.getItemUrlOrThrow(item2)).toBe('hello');
});

test('getPathUrl() + mutation', () => {
  const item1 = callback.setPathItem('hello');

  expect(callback.getItemUrl(item1)).toBe('hello');
  callback.deletePathItem('hello');
  expect(callback.getItemUrl(item1)).toBeUndefined();
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

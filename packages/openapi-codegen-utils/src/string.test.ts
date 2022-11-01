import { commonStringPrefix } from './string';

test('empty array', () => {
  expect(() => commonStringPrefix([])).toThrow();
});

test('1 elemnt', () => {
  expect(commonStringPrefix(['/prefix'])).toBe('/prefix');
});

test('2+ elements', () => {
  expect(commonStringPrefix(['/b/x', '/b/r'])).toBe('/b');
  expect(commonStringPrefix(['/p/refix', '/p/fx', '/p/dz'])).toBe('/p');
});

test('leading /', () => {
  expect(commonStringPrefix(['/items', 'items'])).toBe('/items');
});

test('only complete URL parts', () => {
  expect(commonStringPrefix(['/prefix', '/pfx', '/pdz'])).toBe('');
});

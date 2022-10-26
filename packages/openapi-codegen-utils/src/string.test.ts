import { commonStringPrefix } from './string';

test('snakeCase', () => {
  expect(snakeCase('forget-me-not')).toBe('forget_me_not');
  expect(snakeCase('Forget-me-not')).toBe('forget_me_not');
  expect(snakeCase('forgetMeNot')).toBe('forget_me_not');
  expect(snakeCase('--Forget--MeNot')).toBe('forget_me_not');
});

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

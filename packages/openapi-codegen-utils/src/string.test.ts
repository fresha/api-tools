import { maybeAddLeadingSlash, commonStringPrefix } from './string';

test('maybeAddLeadingSlash', () => {
  expect(maybeAddLeadingSlash('/blocked-times')).toBe('/blocked-times');
  expect(maybeAddLeadingSlash('blocked-times/exports')).toBe('/blocked-times/exports');
});

describe('commonStringPrefix', () => {
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
});

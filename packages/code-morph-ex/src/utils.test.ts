import { significantNameParts } from './utils';

test('significantNameParts', () => {
  expect(significantNameParts('/')).toStrictEqual([]);
  expect(significantNameParts('/x/y/z')).toStrictEqual(['x', 'y', 'z']);
  expect(significantNameParts('/{id}/a/{q}')).toStrictEqual(['a']);
});

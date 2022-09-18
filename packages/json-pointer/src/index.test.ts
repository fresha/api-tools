import { get } from './index';

test('get', () => {
  expect(() => get({}, 'a/b')).toThrow();
  expect(get({ arr: [1, 2, 3] }, '/arr/1')).toBe(2);
});

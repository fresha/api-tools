import { BidiMap } from './BidiMap';

test('querying', () => {
  const value1 = {};
  const value2 = {};

  const map = new BidiMap();
  map.set('key1', value1);
  map.set('key2', value2);

  expect(map.get('key1')).toBe(value1);
  expect(map.getKey(value2)).toBe('key2');

  expect(map.has('key2'));
  expect(map.hasValue(value1));
});

test('mutation', () => {
  const value1 = {};
  const value2 = {};

  const map = new BidiMap();
  map.set('key1', value1);
  map.set('key2', value2);

  expect(map.delete('key3')).toBeFalsy();
  expect(map.deleteValue({})).toBeFalsy();

  expect(map.delete('key1')).toBeTruthy();
  expect(map.size).toBe(1);
  expect(map.hasValue(value1)).toBeFalsy();

  expect(map.deleteValue(value2)).toBeTruthy();
  expect(map.size).toBe(0);
  expect(map.has('key2')).toBeFalsy();

  map.set('key3', {});
  map.clear();
  expect(map.size).toBe(0);
});

test('iteration', () => {
  const value2 = {};

  const map = new BidiMap();
  map.set(1, 2);
  map.set('2', value2);

  const callback = jest.fn();
  const thisArg = {};

  map.forEach(callback, thisArg);

  const callbackCalls = callback.mock.calls as unknown[][];
  expect(callbackCalls.length).toBe(2);

  expect(callbackCalls[0].length).toBe(3);
  expect(callbackCalls[0][0]).toStrictEqual(2);
  expect(callbackCalls[0][1]).toStrictEqual(1);
  expect(callbackCalls[0][2]).toBeInstanceOf(Map);

  expect(callbackCalls[1][0]).toStrictEqual(value2);
  expect(callbackCalls[1][1]).toStrictEqual('2');
  expect(callbackCalls[1][2]).toBeInstanceOf(Map);

  expect(Array.from(map.values())).toStrictEqual([2, value2]);
});

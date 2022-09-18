import { JSONPointer } from './JSONPointer';

import type { JSONValue } from '@fresha/api-tools-core';

test('constructor', () => {
  expect(new JSONPointer('')).toBeInstanceOf(JSONPointer);
  expect(new JSONPointer('/')).toBeInstanceOf(JSONPointer);
  expect(new JSONPointer('/x/y/z')).toBeInstanceOf(JSONPointer);
  expect(() => new JSONPointer('a/b/c')).toThrow();
});

test('get', () => {
  const testObj: JSONValue = {
    numberProp: 1,
    objProp: {
      strProp: 'str',
      boolProp: true,
    },
    arrProp: [12, '34', { subProp: 'cdd' }],
    nullProp: null,
  };

  expect(new JSONPointer('').get(testObj)).toBe(testObj);
  expect(new JSONPointer('/numberProp').get(testObj)).toBe(1);
  expect(new JSONPointer('/objProp/strProp').get(testObj)).toBe('str');
  expect(new JSONPointer('/arrProp/2/subProp').get(testObj)).toBe('cdd');
  expect(new JSONPointer('/nullProp').get(testObj)).toBe(null);
  expect(new JSONPointer('/numberProp/nonExistend').get(testObj)).toBe(undefined);
  expect(new JSONPointer('/objProp/nonExistent').get(testObj)).toBe(undefined);
});

test('toString', () => {
  expect(new JSONPointer('').toString()).toBe('');
  expect(new JSONPointer('/prop/1/arr/obj/str/num/bool').toString()).toBe(
    '/prop/1/arr/obj/str/num/bool',
  );
});

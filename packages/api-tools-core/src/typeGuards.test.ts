import {
  isJSONAPIDataDocument,
  isJSONAPIErrorDocument,
  isJSONObject,
  isJSONRef,
  isJSONValueArray,
} from './typeGuards';

import type { JSONAPIDocument, JSONAPIServerResource } from './types';

test('isJSONObject', () => {
  expect(isJSONObject({})).toBeTruthy();
  expect(isJSONObject(null)).toBeFalsy();
  expect(isJSONObject([])).toBeFalsy();
});

test('isJSONValueArray', () => {
  expect(isJSONValueArray({})).toBeFalsy();
  expect(isJSONValueArray(null)).toBeFalsy();
  expect(isJSONValueArray([])).toBeTruthy();
  expect(isJSONValueArray([1, 's', {}])).toBeTruthy();
});

test('isJSONRef', () => {
  expect(isJSONRef({})).toBeFalsy();
  expect(isJSONRef({ $ref: 'a' })).toBeTruthy();
  expect(isJSONRef({ $ref: 1 })).toBeFalsy();
});

test('JSON:API document types', () => {
  const doc1: JSONAPIDocument<JSONAPIServerResource[]> = {
    jsonapi: { version: '1.0' },
    data: [],
  };
  expect(isJSONAPIDataDocument(doc1)).toBeTruthy();
  expect(isJSONAPIErrorDocument(doc1)).toBeFalsy();

  const doc2: JSONAPIDocument = {
    jsonapi: { version: '1.0' },
    errors: [],
  };
  expect(isJSONAPIDataDocument(doc2)).toBeFalsy();
  expect(isJSONAPIErrorDocument(doc2)).toBeTruthy();
});

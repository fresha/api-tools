import { isJSONAPIDataDocument, isJSONAPIErrorDocument, isJSONRef } from './typeGuards';

import type { JSONAPIDocument } from './types';

test('isJSONRef', () => {
  expect(isJSONRef({})).toBeFalsy();
  expect(isJSONRef({ $ref: 'a' })).toBeTruthy();
  expect(isJSONRef({ $ref: 1 })).toBeFalsy();
});

test('JSON:API document types', () => {
  const doc1: JSONAPIDocument = {
    data: [],
  };
  expect(isJSONAPIDataDocument(doc1)).toBeTruthy();
  expect(isJSONAPIErrorDocument(doc1)).toBeFalsy();

  const doc2: JSONAPIDocument = {
    errors: [],
  };
  expect(isJSONAPIDataDocument(doc2)).toBeFalsy();
  expect(isJSONAPIErrorDocument(doc2)).toBeTruthy();
});

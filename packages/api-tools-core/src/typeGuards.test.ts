import { isJSONAPIDataDocument, isJSONAPIErrorDocument } from './typeGuards';

import type { JSONAPIDocument } from './types';

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

import { JSONAPIDataDocument, JSONAPIDocument, JSONAPIErrorDocument } from './types';

export const isJSONAPIDataDocument = (doc: JSONAPIDocument): doc is JSONAPIDataDocument => {
  return 'data' in doc;
};

export const isJSONAPIErrorDocument = (doc: JSONAPIDocument): doc is JSONAPIErrorDocument => {
  return 'errors' in doc;
};

import type {
  JSONAPIDataDocument,
  JSONAPIDocument,
  JSONAPIErrorDocument,
  JSONObject,
  JSONRef,
} from './types';

export const isJSONRef = (arg: unknown): arg is JSONRef => {
  return arg != null && typeof arg === 'object' && typeof (arg as JSONObject).$ref === 'string';
};

export const isJSONAPIDataDocument = (doc: JSONAPIDocument): doc is JSONAPIDataDocument => {
  return 'data' in doc;
};

export const isJSONAPIErrorDocument = (doc: JSONAPIDocument): doc is JSONAPIErrorDocument => {
  return 'errors' in doc;
};

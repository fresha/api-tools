import type {
  JSONAPIDataDocument,
  JSONAPIDocument,
  JSONAPIErrorDocument,
  JSONAPIPrimaryDocumentData,
  JSONObject,
  JSONRef,
  JSONValue,
} from './types';

export const isJSONObject = (value: JSONValue): value is JSONObject =>
  !Array.isArray(value) && value !== null && typeof value === 'object';

export const isJSONValueArray = (value: JSONValue | JSONValue[] | null): value is JSONValue[] =>
  value !== null && Array.isArray(value);

export const isJSONRef = (arg: unknown): arg is JSONRef =>
  arg != null && typeof arg === 'object' && typeof (arg as JSONObject).$ref === 'string';

export const isJSONAPIDataDocument = <TPrimaryData extends JSONAPIPrimaryDocumentData>(
  doc: JSONAPIDocument<TPrimaryData>,
): doc is JSONAPIDataDocument<TPrimaryData> => 'data' in doc;

export const isJSONAPIErrorDocument = <TPrimaryData extends JSONAPIPrimaryDocumentData>(
  doc: JSONAPIDocument<TPrimaryData>,
): doc is JSONAPIErrorDocument => 'errors' in doc;

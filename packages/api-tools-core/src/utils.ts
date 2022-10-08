import type { JSONValue, JSONObject } from './types';

export type KeyTransformFunc = (key: string) => string;
export type TransformFunc = (obj: JSONValue) => JSONValue;

export const identity: TransformFunc = obj => obj;

export const transformKeysDeep = (obj: JSONValue, keyFn: KeyTransformFunc): JSONValue => {
  if (Array.isArray(obj)) {
    return obj.map(o => transformKeysDeep(o, keyFn));
  }
  if (obj instanceof Object) {
    return Object.entries(obj).reduce((accum: JSONObject, [key, value]) => {
      const newKey = keyFn(key);
      return { ...accum, [newKey]: transformKeysDeep(value, keyFn) };
    }, {});
  }
  return obj;
};

const RE_WORD_START = /[A-Z][^A-Z]/g;

export const kebabCase: KeyTransformFunc = str => {
  const parts = str.replace(RE_WORD_START, r => `-${r.toLowerCase()}`).match(/[a-z0-9]+/g);
  return parts != null ? parts.filter(elem => elem.length).join('-') : str;
};

export const kebabCaseDeep: TransformFunc = obj => transformKeysDeep(obj, kebabCase);

const RE_WORD_SEPARATOR = /[-_]/g;

export const camelCase: KeyTransformFunc = str => {
  return str
    .split(RE_WORD_SEPARATOR)
    .filter(Boolean)
    .map((s, index) => (index > 0 ? s.slice(0, 1).toUpperCase() + s.slice(1) : s))
    .join('');
};

export const camelCaseDeep: TransformFunc = obj => transformKeysDeep(obj, camelCase);

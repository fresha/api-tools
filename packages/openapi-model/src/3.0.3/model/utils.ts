import assert from 'assert';

import isURL from 'validator/lib/isURL';

import type { Nullable, URLString } from '@fresha/api-tools-core';

export const assertValidUrl = (value: URLString): void => {
  assert(isURL(value), `'${value}' is not a valid URL`);
};

export const assertValidUrlOrNull = (value: Nullable<URLString>): void => {
  assert(value == null || isURL(value), `Refresh URL is not a valid URL '${String(value)}'`);
};

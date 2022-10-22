import assert from 'assert';

import { camelCase } from '@fresha/api-tools-core';

export { kebabCase } from '@fresha/api-tools-core';

export { camelCase };

export const titleCase = (str: string): string => {
  const camelized = camelCase(str);
  return `${camelized[0].toUpperCase()}${camelized.slice(1)}`;
};

const maybeAddLeadingSlash = (str: string): string => {
  return str.startsWith('/') ? str : `/${str}`;
};

const maybeRemoveTrailingSlash = (str: string): string => {
  return str !== '/' && str.endsWith('/') ? str.slice(0, -1) : str;
};

const commonPrefix = (str1: string, str2: string): string => {
  const parts1 = str1.split('/');
  const parts2 = str2.split('/');

  for (let index = 0; index < str1.length; index += 1) {
    if (parts1[index] !== parts2[index]) {
      return parts1.slice(0, index).join('/');
    }
  }

  return parts1.join('/');
};

export const commonStringPrefix = (values: string[]): string => {
  assert(values.length > 0);

  let result = maybeAddLeadingSlash(values[0]);

  if (values.length > 1) {
    for (const next of values.slice(1)) {
      result = commonPrefix(result, maybeAddLeadingSlash(next));
    }
  }

  return maybeRemoveTrailingSlash(result);
};

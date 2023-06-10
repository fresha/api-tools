import type { OpenAPIModel, SpecificationExtensionsModel } from '@fresha/openapi-model/build/3.0.3';

export const arrayEqual = (arr1: string[], arr2: string[]): boolean => {
  if (arr1 === arr2) {
    return true;
  }
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i += 1) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

type Node = SpecificationExtensionsModel & {
  root: OpenAPIModel;
};

const isDisabledOnSelf = (obj: SpecificationExtensionsModel, ruleId: string): boolean => {
  const ext = obj.getExtension('fresha-lint-disable');
  if (ext == null) {
    return false;
  }
  if (ext === true) {
    return true;
  }
  if (Array.isArray(ext)) {
    return ext.includes(ruleId);
  }
  return false;
};

export const isDisabled = (obj: Node, ruleId: string): boolean => {
  return isDisabledOnSelf(obj, ruleId) || isDisabledOnSelf(obj.root, ruleId);
};

export const getFileName = (openapi: OpenAPIModel): string => {
  const result = openapi.getExtension('__filename');
  if (typeof result !== 'string') {
    return 'unknown';
  }
  return result;
};

export const enumerate = function* enumerate<T>(
  it: IterableIterator<T>,
): IterableIterator<[T, number]> {
  let i = 0;
  for (const value of it) {
    yield [value, i];
    i += 1;
  }
};

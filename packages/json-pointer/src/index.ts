import { JSONPointer } from './JSONPointer';

import type { JSONValue } from '@fresha/api-tools-core';

export { JSONPointer };
export { JSONPointerResolver } from './JSONPointerResolver';

export const get = (
  obj: JSONValue,
  ptrOrStr: string | string[] | JSONPointer,
): JSONValue | undefined => {
  const ptr = ptrOrStr instanceof JSONPointer ? ptrOrStr : new JSONPointer(ptrOrStr);
  return ptr.get(obj);
};

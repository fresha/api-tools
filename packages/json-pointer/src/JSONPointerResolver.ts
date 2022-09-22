import { JSONPointer } from './JSONPointer';

import type { JSONValue } from '@fresha/api-tools-core';

export class JSONPointerResolver {
  private readonly obj: JSONValue;

  constructor(obj: JSONValue) {
    this.obj = obj;
  }

  get(ptrOrStr: string | string[] | JSONPointer): JSONValue | undefined {
    const ptr = ptrOrStr instanceof JSONPointer ? ptrOrStr : new JSONPointer(ptrOrStr);
    return ptr.get(this.obj);
  }
}

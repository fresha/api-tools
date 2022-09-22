import assert from 'assert';

import type { JSONObject, JSONValue } from '@fresha/api-tools-core';

export class JSONPointer {
  private readonly segments: string[];

  constructor(segments: string | string[]) {
    this.segments = typeof segments === 'string' ? segments.split('/') : segments;
    assert.equal(this.segments[0], '');
  }

  get(obj: JSONValue): JSONValue | undefined {
    if (this.segments.length === 1) {
      return obj;
    }
    let res: JSONValue | undefined = obj;
    for (const seg of this.segments.slice(1)) {
      if (seg) {
        res = res != null ? (res as JSONObject)[seg] : undefined;
        if (res === undefined) {
          break;
        }
      }
    }
    return res;
  }

  toString(): string {
    return this.segments.join('/');
  }
}

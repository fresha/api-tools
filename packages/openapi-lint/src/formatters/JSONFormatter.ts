import console from 'console';

import type { Formatter, Result } from '../types';

export class JSONFormatter implements Formatter {
  // eslint-disable-next-line class-methods-use-this
  format(result: Result): void {
    const json = JSON.stringify(result, null, 2);
    console.log(json);
  }
}

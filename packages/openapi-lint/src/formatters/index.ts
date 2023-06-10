import { JSONFormatter } from './JSONFormatter';
import { SimpleFormatter } from './SimpleFormatter';

import type { Formatter } from '../types';

export const createFormatter = (format: string): Formatter => {
  switch (format) {
    case 'json':
      return new JSONFormatter();
    case 'simple':
      return new SimpleFormatter();
    default:
      throw new Error(`Unknown format: ${format}`);
  }
};

import fs from 'fs';

import { fs as memfs } from 'memfs';

export type FS = typeof fs | typeof memfs;

export const createFileSystem = (useInMemoryFileSystem: boolean): FS => {
  let result: FS = fs;
  if (useInMemoryFileSystem) {
    result = memfs;
    result.mkdirSync(process.cwd(), { recursive: true });
  }
  return result;
};

export const significantNameParts = (pathUrl: string): string[] =>
  pathUrl.split('/').filter(x => x && !(x.startsWith('{') && x.endsWith('}')));

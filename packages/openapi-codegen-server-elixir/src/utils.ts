import path from 'path';

export const getPhoenixAppPath = (rootDir: string, appName: string): string => {
  return path.join(rootDir, 'apps', appName);
};

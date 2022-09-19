export const significantNameParts = (pathUrl: string): string[] =>
  pathUrl.split('/').filter(x => x && !(x.startsWith('{') && x.endsWith('}')));

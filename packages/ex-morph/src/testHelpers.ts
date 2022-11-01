export const poorMansElixirFormat = (s: string): string => {
  const lines = s.replace(/(^\\n+)|(\s+$)/g, '').split('\n');
  if (!lines[0]) {
    lines.shift();
  }
  const indent = lines[0].search(/\S/);
  return lines.map(line => line.slice(indent)).join('\n');
};

export const defaultRequired: Record<string, boolean> = {
  query: false,
  header: false,
  path: true,
  cookie: false,
};

export const defaultSerializationStyles: Record<string, string> = {
  query: 'form',
  path: 'simple',
  header: 'simple',
  cookie: 'form',
};

export const defaultExplode: Record<string, boolean> = {
  matrix: false,
  label: false,
  form: true,
  simple: false,
  spaceDelimited: false,
  pipeDelimited: false,
  deepObject: false,
};

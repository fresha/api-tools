export const defaultRequired: Record<string, boolean> = {
  query: false,
  header: false,
  path: true,
  cookie: false,
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

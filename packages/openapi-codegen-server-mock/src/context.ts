export { createTSProjectContext as createContext } from '@fresha/openapi-codegen-utils';

export interface CreateContextParams {
  input: string;
  output: string;
  jsonApi?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
}

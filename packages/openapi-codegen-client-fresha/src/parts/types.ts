import type { TSProjectContext as BasicContext } from '@fresha/openapi-codegen-utils';

export interface Context extends BasicContext {
  readonly apiName: string;
  readonly apiRootUrl: string;
}

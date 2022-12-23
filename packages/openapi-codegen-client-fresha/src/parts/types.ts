import type { TSProjectContext } from '@fresha/openapi-codegen-utils';

export interface Context extends TSProjectContext {
  readonly apiName: string;
  readonly apiRootUrl: string;
}

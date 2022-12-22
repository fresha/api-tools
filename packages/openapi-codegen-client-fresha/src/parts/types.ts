import type { Context as BasicContext } from '@fresha/openapi-codegen-utils';
import type { Project } from 'ts-morph';

type APIRootURL = string;

export interface Context extends BasicContext {
  readonly project: Project;
  readonly apiName: string;
  readonly apiRootUrl: APIRootURL;
}

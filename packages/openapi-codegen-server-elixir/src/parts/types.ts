import type { Project } from '@fresha/ex-morph';
import type { RegistryModel } from '@fresha/json-api-model';
import type { Context as BasicContext } from '@fresha/openapi-codegen-utils';

export interface Context extends BasicContext {
  readonly testObjectFactoryModuleName: string;
  readonly project: Project;
  readonly registry: RegistryModel;
}

import type { Context as BasicContext } from '@fresha/openapi-codegen-utils';
import type { Project } from 'ts-morph';

export interface Context extends BasicContext {
  readonly project: Project;
}

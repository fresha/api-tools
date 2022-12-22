import type { DTO } from './DTO';
import type { Nullable } from '@fresha/api-tools-core';
import type { Context as BasicContext } from '@fresha/openapi-codegen-utils';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';
import type { Project } from 'ts-morph';

export interface Context extends BasicContext {
  readonly project: Project;
  readonly nestApp: string;

  addDTO(name: string, schema: Nullable<SchemaModel>): DTO;
}

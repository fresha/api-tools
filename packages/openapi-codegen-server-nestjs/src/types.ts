import type { DTO } from './DTO';
import type { Nullable } from '@fresha/api-tools-core';
import type { TSProjectContext as BasicContext } from '@fresha/openapi-codegen-utils';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export interface Context extends BasicContext {
  readonly nestApp: string;

  addDTO(name: string, schema: Nullable<SchemaModel>): DTO;
}
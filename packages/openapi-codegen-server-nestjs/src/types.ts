import type { DTO } from './DTO';
import type { Nullable } from '@fresha/api-tools-core';
import type { TSProjectContext } from '@fresha/openapi-codegen-utils';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export interface Context extends TSProjectContext {
  readonly nestApp: string;

  addDTO(name: string, schema: Nullable<SchemaModel>): DTO;
}

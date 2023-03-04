import type { ActionContext } from '../context';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export abstract class NamedType {
  readonly context: ActionContext;
  readonly name: string;
  readonly schema: SchemaModel;
  readonly isRequestBody: boolean;
  readonly isRequired: boolean;

  constructor(
    context: ActionContext,
    name: string,
    schema: SchemaModel,
    isRequestBody: boolean,
    isRequired: boolean,
  ) {
    this.context = context;
    this.name = name;
    this.schema = schema;
    this.isRequestBody = isRequestBody;
    this.isRequired = isRequired;
  }

  abstract collectData(namedTypes: Map<string, NamedType>): void;
  abstract generateCode(generatedTypes: Set<string>): void;
}

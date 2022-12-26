import type { ActionContext } from '../context';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export abstract class NamedType {
  readonly context: ActionContext;
  readonly name: string;
  readonly schema: SchemaModel;

  constructor(context: ActionContext, name: string, schema: SchemaModel) {
    this.context = context;
    this.name = name;
    this.schema = schema;
  }

  abstract collectData(namedTypes: Map<string, NamedType>): void;
  abstract generateCode(generatedTypes: Set<string>): void;
}

import type { CommonMarkString, JSONValue, Nullable } from '@fresha/api-tools-core';

export type ExtensionFields = ReadonlyMap<string, JSONValue>;

export interface ISchemaBase {
  readonly root: ISchemaRegistry;
  readonly extensionFields: ExtensionFields;
  title: Nullable<string>;
  description: Nullable<CommonMarkString>;
  format: Nullable<SchemaFormat>;
  nullable: boolean;
  default: JSONValue;
  example: JSONValue;
}

export interface INullSchema extends ISchemaBase {
  readonly type: 'null';
}

export interface IBooleanSchema extends ISchemaBase {
  readonly type: 'boolean';
}

export interface INumberSchema extends ISchemaBase {
  readonly type: 'number';
}

export interface IStringSchema extends ISchemaBase {
  readonly type: 'string';
  minLength: Nullable<number>;
  maxLength: Nullable<number>;
  pattern: Nullable<string>;
}

export interface IObjectSchema extends ISchemaBase {
  readonly type: 'object';
  readonly properties: ReadonlyMap<string, JSONSchemaOrReference>;
  additionalProperties: JSONSchemaOrReference | boolean;
}

export interface IArraySchema extends ISchemaBase {
  readonly type: 'array';
  readonly itemSchema: JSONSchemaOrReference;
}

export interface INotSchema extends ISchemaBase {
  readonly type: 'not';
  readonly baseSchema: JSONSchemaOrReference;
}

export interface IOneOfSchema extends ISchemaBase {
  readonly type: 'oneOf';
  readonly alternatives: ReadonlyArray<JSONSchemaOrReference>;
}

export interface IAnyOfSchema extends ISchemaBase {
  readonly type: 'anyOf';
  readonly alternatives: ReadonlyArray<JSONSchemaOrReference>;
}

export interface IAllOfSchema extends ISchemaBase {
  readonly type: 'allOf';
  readonly alternatives: ReadonlyArray<JSONSchemaOrReference>;
}

export type JSONSchema =
  | INullSchema
  | IBooleanSchema
  | INumberSchema
  | IStringSchema
  | IObjectSchema
  | IArraySchema
  | INotSchema
  | IOneOfSchema
  | IAnyOfSchema
  | IAllOfSchema;

export type JSONSchemaType = JSONSchema['type'];

export interface IReference {
  ref: string;
  readonly extensionFields: ExtensionFields;
}

export type JSONSchemaOrReference = JSONSchema | IReference;

export type SchemaFormat =
  | 'int32'
  | 'int64'
  | 'float'
  | 'double'
  | 'byte'
  | 'binary'
  | 'date'
  | 'date-time'
  | 'password';

export interface ISchemaRegistry {
  readonly schemas: ReadonlyMap<string, JSONSchemaOrReference>;

  allOf(...alts: JSONSchemaOrReference[]): IAllOfSchema;
  anyOf(...alts: JSONSchemaOrReference[]): IAnyOfSchema;
  oneOf(...alts: JSONSchemaOrReference[]): IOneOfSchema;
  not(base: JSONSchemaOrReference): INotSchema;
}

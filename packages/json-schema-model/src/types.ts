import type { CommonMarkString, JSONValue, Nullable } from '@fresha/api-tools-core';

export type ExtensionFields = ReadonlyMap<string, JSONValue>;

export interface ISchemaBase {
  readonly id: string;
  readonly root: ISchemaRegistry;
  readonly extensionFields: ExtensionFields;
  title: Nullable<string>;
  description: Nullable<CommonMarkString>;
  format: Nullable<SchemaFormat>;
  nullable: boolean;
  default: JSONValue;
  example: JSONValue;
}

export interface IBooleanSchema extends ISchemaBase {
  readonly type: 'boolean';
  allowed: Nullable<boolean[]>;
}

export interface INumberSchema extends ISchemaBase {
  readonly type: 'number';
  allowed: Nullable<number[]>;
  multipleOf: Nullable<number>;
  maximum: Nullable<number>;
  exclusiveMaximum: boolean;
  minimum: Nullable<number>;
  exclusiveMinimum: boolean;
}

export interface IStringSchema extends ISchemaBase {
  readonly type: 'string';
  allowed: Nullable<string[]>;
  minLength: Nullable<number>;
  maxLength: Nullable<number>;
  pattern: Nullable<string>;
}

type AddPropertyOptions = Partial<{
  required: boolean;
}>;

export type AddBooleanSchemaOptions = Partial<{
  allowed: boolean[];
}>;

export type AddBooleanPropertyOptions = AddPropertyOptions & AddBooleanSchemaOptions;

export type AddNumberSchemaOptions = Partial<{
  allowed: number[];
  maximum: number;
  exclusiveMaximum: boolean;
  minimum: number;
  exclusiveMinimum: boolean;
  multipleOf: number;
}>;

export type AddNumberPropertyOptions = AddPropertyOptions & AddNumberSchemaOptions;

export type AddStringSchemaOptions = Partial<{
  minLength: number;
  maxLength: number;
  pattern: string;
  allowed: string[];
}>;

export type AddStringPropertyOptions = AddPropertyOptions & AddStringSchemaOptions;

export interface IObjectSchema extends ISchemaBase {
  readonly type: 'object';
  readonly properties: ReadonlyMap<string, JSONSchemaOrReference>;
  additionalProperties: JSONSchemaOrReference | boolean;

  addProperty(name: string, type: 'boolean', options?: AddBooleanPropertyOptions): IBooleanSchema;
  addProperty(name: string, type: 'number', options?: AddNumberPropertyOptions): INumberSchema;
  addProperty(name: string, type: 'string', options?: AddStringPropertyOptions): IStringSchema;
  addProperty(name: string, type: 'object'): IObjectSchema;
  addProperty(name: string, type: 'array'): IArraySchema;
  removeProperty(name: string): void;
  clearProperties(): void;
}

export type ObjectCreateOrSetSchemaOptions = Partial<{
  required: boolean;
}>;

export interface IArraySchema extends ISchemaBase {
  readonly type: 'array';
  readonly itemSchema: JSONSchemaOrReference;
}

export type ArrayCreateOrSetSchemaOptions = Partial<{
  required: boolean;
}>;

export interface INotSchema extends ISchemaBase {
  readonly type: 'not';
  readonly baseSchema: JSONSchemaOrReference;
}

export type NotCreateOrSetSchemaOptions = Partial<{
  required: boolean;
}>;

export interface IOneOfSchema extends ISchemaBase {
  readonly type: 'oneOf';
  readonly alternatives: ReadonlyArray<JSONSchemaOrReference>;
}

export type OneOfCreateOrSetSchemaOptions = Partial<{
  required: boolean;
}>;

export interface IAnyOfSchema extends ISchemaBase {
  readonly type: 'anyOf';
  readonly alternatives: ReadonlyArray<JSONSchemaOrReference>;
}

export type AnyOfCreateOrSetSchemaOptions = Partial<{
  required: boolean;
}>;

export interface IAllOfSchema extends ISchemaBase {
  readonly type: 'allOf';
  readonly alternatives: ReadonlyArray<JSONSchemaOrReference>;
}

export type AllOfCreateOrSetSchemaOptions = Partial<{
  required: boolean;
}>;

export type JSONSchema =
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
  readonly schemas: ReadonlyMap<string, JSONSchema>;

  add(type: 'boolean', options?: AddBooleanSchemaOptions): IBooleanSchema;
  add(type: 'number', options?: AddNumberSchemaOptions): INumberSchema;
  add(type: 'string', options?: AddStringSchemaOptions): IStringSchema;
  add(type: 'object'): IObjectSchema;
  add(type: 'array'): IArraySchema;

  allOf(...alts: JSONSchemaOrReference[]): IAllOfSchema;
  anyOf(...alts: JSONSchemaOrReference[]): IAnyOfSchema;
  oneOf(...alts: JSONSchemaOrReference[]): IOneOfSchema;
  not(base: JSONSchemaOrReference): INotSchema;
}

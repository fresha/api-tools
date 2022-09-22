import { SchemaParent } from './Schema';

import type {
  PathParameterSerializationStyle,
  QueryParameterSerializationStyle,
  Ref,
  SchemaFormat,
  SchemaType,
} from '../types';
import type {
  CommonMarkString,
  EmailString,
  JSONValue,
  Nullable,
  URLString,
  VersionString,
} from '@fresha/api-tools-core';

export { PathParameterSerializationStyle, QueryParameterSerializationStyle, Ref };

export type OpenApiVersion = '3.0.3';
export type ParametrisedURLString = string; // URLString with interpolations, like /list/{from}/{to}

export type MIMETypeString = string;

export interface Disposable {
  dispose(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#specification-extensions
 */
export interface SpecificationExtensionsModel {
  readonly extensions: ReadonlyMap<string, JSONValue>;

  setExtension(key: string, value: JSONValue): void;
  deleteExtension(key: string): void;
  clearExtensions(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#discriminator-object
 */
export interface DiscriminatorModel extends Disposable, SpecificationExtensionsModel {
  propertyName: string;
  readonly mapping: ReadonlyMap<string, string>;
}

/**
 * Convenience type, used during schema creation.
 */
export type SchemaCreateType = null | SchemaType | SchemaFormat;

export type SchemaCreateObject = {
  type: SchemaCreateType | SchemaModel;
  required?: boolean;
};

export type SchemaCreateOptions = SchemaCreateType | SchemaModel | SchemaCreateObject;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#schema-object
 */
export interface SchemaModel extends Disposable, SpecificationExtensionsModel {
  title: Nullable<string>;
  multipleOf: Nullable<number>;
  maximum: Nullable<number>;
  exclusiveMaximum: Nullable<number>;
  minimum: Nullable<number>;
  exclusiveMinimum: Nullable<number>;
  maxLength: Nullable<number>;
  minLength: Nullable<number>;
  pattern: Nullable<string>;
  maxItems: Nullable<number>;
  minItems: Nullable<number>;
  uniqueItems: boolean;
  maxProperties: Nullable<number>;
  minProperties: Nullable<number>;
  readonly required: Set<string>;
  enum: Nullable<JSONValue[]>;
  type: Nullable<SchemaType>;
  allOf: Nullable<SchemaModel[]>;
  oneOf: Nullable<SchemaModel[]>;
  anyOf: Nullable<SchemaModel[]>;
  not: Nullable<SchemaModel>;
  items: Nullable<SchemaModel>;
  readonly properties: ReadonlyMap<string, SchemaModel>;
  additionalProperties: Nullable<SchemaModel | boolean>;
  description: Nullable<CommonMarkString>;
  format: Nullable<SchemaFormat>;
  default: Nullable<JSONValue>;
  nullable: boolean;
  discriminator: Nullable<DiscriminatorModel>;
  readOnly: boolean;
  writeOnly: boolean;
  xml: Nullable<XMLModel>;
  externalDocs: Nullable<ExternalDocumentationModel>;
  example: Nullable<JSONValue>;
  deprecated: boolean;

  setProperty(name: string, options: SchemaCreateOptions): SchemaModel;
  setProperties(props: Record<string, SchemaCreateOptions>): SchemaModel;
  deleteProperty(name: string): void;
  clearProperties(): void;

  setPropertyRequired(name: string, value: boolean): void;

  addAllOf(options: SchemaCreateOptions): SchemaModel;
  deleteAllOfAt(index: number): void;
  clearAllOf(): void;

  addOneOf(options: SchemaCreateOptions): SchemaModel;
  deleteOneOfAt(index: number): void;
  clearOneOf(): void;

  arrayOf(parent: SchemaParent): SchemaModel;
}

export type SchemaCreateArrayObject = {
  itemsOptions: SchemaCreateOptions;
  minItems?: number;
  maxItems?: number;
};

export type SchemaCreateArrayOptions = SchemaCreateType | SchemaModel | SchemaCreateArrayObject;

/**
 * This class provides convenience methods for creating SchemaObject-s.
 */
export interface SchemaModelFactory {
  create(parent: SchemaParent, params: Exclude<SchemaCreateType, SchemaModel>): SchemaModel;
  createArray(parent: SchemaParent, options: SchemaCreateArrayOptions): SchemaModel;
  createObject(parent: SchemaParent, props: Record<string, SchemaCreateOptions>): SchemaModel;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#contact-object
 */
export interface ContactModel extends Disposable, SpecificationExtensionsModel {
  name: Nullable<string>;
  url: Nullable<string>;
  email: Nullable<EmailString>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#license-object
 */
export interface LicenseModel extends Disposable, SpecificationExtensionsModel {
  name: string;
  url: Nullable<URLString>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#info-object
 */
export interface InfoModel extends Disposable, SpecificationExtensionsModel {
  title: string;
  description: Nullable<CommonMarkString>;
  termsOfService: Nullable<URLString>;
  readonly contact: ContactModel;
  readonly license: LicenseModel;
  version: VersionString;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#server-variable-object
 */
export interface ServerVariableModel extends Disposable, SpecificationExtensionsModel {
  enum: Nullable<string[]>;
  default: string;
  description: Nullable<CommonMarkString>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#server-object
 */
export interface ServerModel extends Disposable, SpecificationExtensionsModel {
  url: string;
  description: Nullable<CommonMarkString>;
  readonly variables: ReadonlyMap<string, ServerVariableModel>;

  setVariableDefault(name: string, value: string): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#external-documentation-object
 */
export interface ExternalDocumentationModel extends Disposable, SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
  url: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface ParameterBaseModel extends Disposable, SpecificationExtensionsModel {
  name: string;
  description: Nullable<CommonMarkString>;
  deprecated: boolean;
  schema: Nullable<SchemaModel>;
  example: Nullable<JSONValue>;
  readonly examples: ReadonlyMap<string, ExampleModel>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface PathParameterModel extends Disposable, ParameterBaseModel {
  readonly in: 'path';
  readonly required: true;
  style: PathParameterSerializationStyle;
  explode: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface QueryParameterModel extends Disposable, ParameterBaseModel {
  readonly in: 'query';
  required: boolean;
  allowEmptyValue: boolean;
  style: QueryParameterSerializationStyle;
  explode: boolean;
  allowReserved: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface HeaderParameterModel extends Disposable, ParameterBaseModel {
  readonly in: 'header';
  required: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface CookieParameterModel extends Disposable, ParameterBaseModel {
  readonly in: 'cookie';
  required: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export type ParameterModel =
  | PathParameterModel
  | QueryParameterModel
  | HeaderParameterModel
  | CookieParameterModel;

export type ParameterLocation = ParameterModel['in'];

/**
 * @see https://spec.openapis.org/oas/v3.0.3#example-object
 */
export interface ExampleModel extends Disposable, SpecificationExtensionsModel {
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;
  value: JSONValue;
  externalValue: Nullable<string>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#header-object
 */
export interface HeaderModel extends Disposable, SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
  required: boolean;
  deprecated: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#encoding-object
 */
export interface EncodingModel extends Disposable, SpecificationExtensionsModel {
  contentType: Nullable<string>;
  readonly headers: ReadonlyMap<string, HeaderModel>;
  style: Nullable<string>;
  explode: boolean;
  allowReserved: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#media-type-object
 */
export interface MediaTypeModel extends Disposable, SpecificationExtensionsModel {
  schema: Nullable<SchemaModel>;
  example: JSONValue;
  readonly examples: ReadonlyMap<string, ExampleModel>;
  readonly encoding: ReadonlyMap<string, EncodingModel>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#request-body-object
 */
export interface RequestBodyModel extends Disposable, SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
  readonly content: ReadonlyMap<MIMETypeString, MediaTypeModel>;
  required: boolean;

  setContent(mimeType: MIMETypeString): MediaTypeModel;
  deleteContent(mimeType: MIMETypeString): void;
  clearContent(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#response-object
 */
export interface ResponseModel extends Disposable, SpecificationExtensionsModel {
  description: CommonMarkString;
  readonly headers: ReadonlyMap<string, HeaderModel>; // key = HTTP header name
  readonly content: ReadonlyMap<MIMETypeString, MediaTypeModel>; // key = MIME media type
  readonly links: ReadonlyMap<string, LinkModel>; // key = short name of the link

  setContent(mimeType: MIMETypeString): MediaTypeModel;
  deleteContent(mimeType: MIMETypeString): void;
  clearContent(): void;
}

export type HTTPStatusCode = number | string;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#responses-object
 */
export interface ResponsesModel extends Disposable, SpecificationExtensionsModel {
  default: Nullable<ResponseModel>;
  readonly codes: ReadonlyMap<HTTPStatusCode, ResponseModel>;

  setDefaultResponse(description: CommonMarkString): ResponseModel;
  deleteDefaultResponse(): void;

  setResponse(code: HTTPStatusCode, description: CommonMarkString): ResponseModel;
  deleteResponse(code: HTTPStatusCode): void;
  clearResponses(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#operation-object
 */
export interface OperationModel extends Disposable, SpecificationExtensionsModel {
  readonly tags: ReadonlyArray<string>;
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;
  externalDocs: Nullable<ExternalDocumentationModel>;
  operationId: Nullable<string>;
  requestBody: Nullable<RequestBodyModel>;
  readonly responses: ResponsesModel;
  callbacks: Nullable<Map<string, CallbackModel>>;
  deprecated: boolean;
  security: Nullable<SecurityRequirementModel[]>;
  servers: Nullable<ServerModel[]>;
  readonly parameters: ParameterModel[];

  addParameter(name: string, source: 'path'): PathParameterModel;
  addParameter(name: string, source: 'query'): QueryParameterModel;
  addParameter(name: string, source: 'header'): HeaderParameterModel;
  addParameter(name: string, source: 'cookie'): CookieParameterModel;
  deleteParameter(name: string): void;
  clearParameters(): void;

  addTag(name: string): void;
  deleteTag(name: string): void;
  deleteTagAt(index: number): void;
  clearTags(): void;
}

export type HTTPMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#paths-object
 */
export interface PathItemModel extends Disposable, SpecificationExtensionsModel {
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;
  get: Nullable<OperationModel>;
  put: Nullable<OperationModel>;
  post: Nullable<OperationModel>;
  delete: Nullable<OperationModel>;
  options: Nullable<OperationModel>;
  head: Nullable<OperationModel>;
  patch: Nullable<OperationModel>;
  trace: Nullable<OperationModel>;
  servers: Nullable<ServerModel[]>;
  // parameters: Nullable<IParameter[]>;

  operations(): IterableIterator<[HTTPMethod, OperationModel]>;

  setOperation(method: HTTPMethod): OperationModel;
  removeOperation(method: HTTPMethod): void;
  clearOperations(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#paths-object
 */
export interface PathsModel
  extends Disposable,
    Map<ParametrisedURLString, PathItemModel>,
    SpecificationExtensionsModel {}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface SecuritySchemaBaseModel extends Disposable, SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface APIKeySecuritySchemaModel extends Disposable, SecuritySchemaBaseModel {
  readonly type: 'apiKey';
  name: string;
  in: 'query' | 'header' | 'cookie';
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface HTTPSecuritySchemaModel extends Disposable, SecuritySchemaBaseModel {
  readonly type: 'http';
  description: Nullable<CommonMarkString>;
  scheme: SchemaModel;
  bearerFormat: Nullable<string>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
interface OAuthFlowBaseModel extends Disposable, SpecificationExtensionsModel {
  refreshUrl: Nullable<URLString>;
  readonly scopes: ReadonlyMap<string, string>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export interface OAuthImplicitFlowModel extends Disposable, OAuthFlowBaseModel {
  authorizationUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export interface OAuthPasswordFlowModel extends Disposable, OAuthFlowBaseModel {
  tokenUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export interface OAuthClientCredentialsFlowModel extends Disposable, OAuthFlowBaseModel {
  tokenUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export interface OAuthAuthorizationCodeFlowModel extends Disposable, OAuthFlowBaseModel {
  authorizationUrl: URLString;
  tokenUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flows-object
 */
export interface OAuthFlowsModel extends Disposable, SpecificationExtensionsModel {
  implicit: Nullable<OAuthImplicitFlowModel>;
  password: Nullable<OAuthPasswordFlowModel>;
  clientCredentials: Nullable<OAuthClientCredentialsFlowModel>;
  authorizationCode: Nullable<OAuthAuthorizationCodeFlowModel>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface OAuth2SecuritySchemaModel extends Disposable, SecuritySchemaBaseModel {
  readonly type: 'oauth2';
  readonly flows: OAuthFlowsModel;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface OpenIDConnectSecuritySchemaModel extends Disposable, SecuritySchemaBaseModel {
  readonly type: 'openIdConnect';
  openIdConnectUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export type SecuritySchemaModel =
  | APIKeySecuritySchemaModel
  | HTTPSecuritySchemaModel
  | OAuth2SecuritySchemaModel
  | OpenIDConnectSecuritySchemaModel;

export type SecuritySchemeType = SecuritySchemaModel['type'];

/**
 * @see https://spec.openapis.org/oas/v3.0.3#link-object
 */
export interface LinkModel extends Disposable, SpecificationExtensionsModel {
  operationRef: Nullable<string>;
  operationId: Nullable<string>;
  readonly parameters: ReadonlyMap<string, JSONValue>;
  requestBody: JSONValue;
  description: Nullable<CommonMarkString>;
  server: Nullable<ServerModel>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#callback-object
 */
export interface CallbackModel extends Disposable, SpecificationExtensionsModel {
  readonly paths: ReadonlyMap<ParametrisedURLString, PathItemModel>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#components-object
 */
export interface ComponentsModel extends Disposable, SpecificationExtensionsModel {
  readonly schemas: ReadonlyMap<string, SchemaModel>;
  readonly responses: ReadonlyMap<string, ResponseModel>;
  readonly parameters: ReadonlyMap<string, ParameterModel>;
  readonly examples: ReadonlyMap<string, ExampleModel>;
  readonly requestBodies: ReadonlyMap<string, RequestBodyModel>;
  readonly headers: ReadonlyMap<string, HeaderModel>;
  readonly securitySchemes: ReadonlyMap<string, SecuritySchemaModel>;
  readonly links: ReadonlyMap<string, LinkModel>;
  readonly callbacks: ReadonlyMap<string, CallbackModel>;

  setSchema(name: string, type?: SchemaType): SchemaModel;
  deleteSchema(name: string): void;
  clearSchemas(): void;

  setResponse(name: string, description: CommonMarkString): ResponseModel;
  deleteResponse(name: string): void;
  clearResponses(): void;

  setParameter(name: string, kind: ParameterModel['in'], paramName: string): ParameterModel;
  deleteParameter(name: string): void;
  clearParameters(): void;

  setExample(name: string): ExampleModel;
  deleteExample(name: string): void;
  clearExamples(): void;

  setRequestBody(name: string): RequestBodyModel;
  deleteRequestBody(name: string): void;
  clearRequestBodies(): void;

  setHeader(name: string): HeaderModel;
  deleteHeader(name: string): void;
  clearHeaders(): void;

  setSecuritySchema(name: string, kind: SecuritySchemaModel['type']): SecuritySchemaModel;
  deleteSecuritySchema(name: string): void;
  clearSecuritySchemes(): void;

  setLink(name: string): LinkModel;
  deleteLink(name: string): void;
  clearLinks(): void;

  setCallback(name: string): CallbackModel;
  deleteCallback(name: string): void;
  clearCallbacks(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-requirement-object
 */
export interface SecurityRequirementModel extends Disposable, SpecificationExtensionsModel {
  readonly scopes: ReadonlyMap<string, string[]>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#tag-object
 */
export interface TagModel extends Disposable, SpecificationExtensionsModel {
  name: string;
  description: Nullable<CommonMarkString>;
  externalDocs: Nullable<ExternalDocumentationModel>;
}

/**
 * @see http://spec.openapis.org/oas/v3.0.3#xml-object
 */
export interface XMLModel extends Disposable, SpecificationExtensionsModel {
  name: Nullable<string>;
  namespace: Nullable<string>;
  prefix: Nullable<string>;
  attribute: boolean;
  wrapped: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#version-3.0.3
 */
export interface OpenAPIModel extends Disposable, SpecificationExtensionsModel {
  readonly openapi: OpenApiVersion;
  readonly info: InfoModel;
  readonly servers: ReadonlyArray<ServerModel>; // by default it contains a server with '/' url
  readonly paths: PathsModel;
  readonly components: ComponentsModel;
  readonly tags: ReadonlyArray<TagModel>;
  readonly externalDocs: Nullable<ExternalDocumentationModel>;

  addServer(
    url: ParametrisedURLString,
    variableDefaults?: Record<string, string>,
    description?: CommonMarkString,
  ): ServerModel;
  removeServerAt(index: number): void;
  clearServers(): void;

  setPathItem(url: ParametrisedURLString): PathItemModel;
  deletePathItem(url: ParametrisedURLString): void;
  clearPathItems(): void;

  addTag(name: string): TagModel;
  deleteTag(name: string): void;
  deleteTagAt(index: number): void;
  clearTags(): void;
}

export interface OpenAPIModelFactory {
  create(): OpenAPIModel;
  create(title: string, version: string): OpenAPIModel;
}

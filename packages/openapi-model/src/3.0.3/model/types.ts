import type {
  PathParameterSerializationStyle,
  QueryParameterSerializationStyle,
  CookieParameterSerializationStyle,
  HeaderParameterSerializationStyle,
  SchemaFormat,
  SchemaType,
} from '../types';
import type {
  CommonMarkString,
  Disposable,
  EmailString,
  HTTPMethod,
  JSONValue,
  MIMETypeString,
  Nullable,
  ParametrisedURLString,
  URLString,
  VersionString,
} from '@fresha/api-tools-core';

export {
  PathParameterSerializationStyle,
  QueryParameterSerializationStyle,
  HeaderParameterSerializationStyle,
  CookieParameterSerializationStyle,
  SchemaFormat,
  SchemaType,
};

export type OpenApiVersion = '3.0.3';

export type ExtensionFields = Map<string, JSONValue>;

export interface TreeNode<TParent> extends Disposable {
  readonly root: OpenAPIModel;
  readonly parent: TParent;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#specification-extensions
 */
export interface SpecificationExtensionsModel {
  readonly extensions: ExtensionFields;

  getExtension(key: string): JSONValue | undefined;
  getExtensionOrThrow(key: string): JSONValue;
  setExtension(key: string, value: JSONValue): void;
  deleteExtension(key: string): void;
  clearExtensions(): void;
}

export type DiscriminatorModelParent = SchemaModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#discriminator-object
 */
export interface DiscriminatorModel
  extends TreeNode<DiscriminatorModelParent>,
    SpecificationExtensionsModel {
  propertyName: string;
  readonly mapping: ReadonlyMap<string, string>;
}

/**
 * Convenience type, used during schema creation.
 */
export type SchemaCreateType = null | SchemaType | SchemaFormat;

export type SchemaCreateObject = (
  | {
      type: null | 'object' | 'array' | SchemaModel;
    }
  | {
      type: 'boolean';
      enum?: boolean[];
      default?: boolean;
    }
  | {
      type: 'integer' | 'number' | 'int32' | 'int64';
      minimum?: number;
      maximum?: number;
      exclusiveMinimum?: number;
      exclusiveMaximum?: number;
      enum?: number[];
      default?: number;
    }
  | {
      type: 'date' | 'date-time' | 'email' | 'decimal';
      enum?: string[];
      default?: string;
    }
  | {
      type: 'string';
      enum?: string[];
      default?: string;
      pattern?: string;
      minLength?: number;
      maxLength?: number;
    }
) & {
  required?: boolean;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
};

export type SchemaCreateOptions = SchemaCreateType | SchemaModel | SchemaCreateObject;

export type SchemaModelParent =
  | ComponentsModel
  | MediaTypeModel
  | ParameterModel
  | HeaderModel
  | SchemaModel
  | HTTPSecuritySchemaModel;

/**
 * SchemaModel iterators yield this objects. This reduces number of objects that should be
 * passed around, to one.
 */
export type SchemaPropertyObject = {
  readonly name: string;
  readonly schema: SchemaModel;
  readonly required: boolean;
};

/**
 * @see https://spec.openapis.org/oas/v3.0.3#schema-object
 */
export interface SchemaModel extends TreeNode<SchemaModelParent>, SpecificationExtensionsModel {
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

  /**
   * Returns true if this schema has at least one subschema in allOf, oneOf or anyOf lists;
   * return false otherwise.
   */
  isComposite(): boolean;

  /**
   * Returns true if this schema represents only the null value; returns false otherwise.
   * Technically this is the schema without explicitly given type, and with the single
   * enum value of null.
   */
  isNull(): boolean;

  /**
   * Returns true if this schemas or one of its subschemas (allOf, oneOf or anyOf) are either
   * null schemas or nullable (i.e. have nullable attribute set to true).
   */
  isNullish(): boolean;

  getProperties(): IterableIterator<SchemaPropertyObject>;
  getProperty(name: string): SchemaModel | undefined;
  getPropertyOrThrow(name: string): SchemaModel;
  setProperty(name: string, options: SchemaCreateOptions): SchemaModel;
  setProperties(props: Record<string, SchemaCreateOptions>): SchemaModel;
  deleteProperty(name: string): void;
  clearProperties(): void;

  isPropertyRequired(name: string): boolean;
  setPropertyRequired(name: string, value: boolean): void;

  addAllOf(options: SchemaCreateOptions): SchemaModel;
  deleteAllOfAt(index: number): void;
  clearAllOf(): void;

  addOneOf(options: SchemaCreateOptions): SchemaModel;
  deleteOneOfAt(index: number): void;
  clearOneOf(): void;

  addAnyOf(options: SchemaCreateOptions): SchemaModel;
  deleteAnyOfAt(index: number): void;
  clearAnyOf(): void;

  arrayOf(parent: SchemaModelParent): SchemaModel;
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
  create(parent: SchemaModelParent, params: Exclude<SchemaCreateType, SchemaModel>): SchemaModel;
  createArray(parent: SchemaModelParent, options: SchemaCreateArrayOptions): SchemaModel;
  createObject(parent: SchemaModelParent, props: Record<string, SchemaCreateOptions>): SchemaModel;
}

export type ContactModelParent = InfoModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#contact-object
 */
export interface ContactModel extends TreeNode<ContactModelParent>, SpecificationExtensionsModel {
  name: Nullable<string>;
  url: Nullable<string>;
  email: Nullable<EmailString>;
}

export type LicenseModelParent = InfoModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#license-object
 */
export interface LicenseModel extends TreeNode<LicenseModelParent>, SpecificationExtensionsModel {
  name: string;
  url: Nullable<URLString>;
}

export type InfoModelParent = OpenAPIModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#info-object
 */
export interface InfoModel extends TreeNode<InfoModelParent>, SpecificationExtensionsModel {
  title: string;
  description: Nullable<CommonMarkString>;
  termsOfService: Nullable<URLString>;
  readonly contact: ContactModel;
  readonly license: LicenseModel;
  version: VersionString;
}

export type ServerVariableModelParent = ServerModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#server-variable-object
 */
export interface ServerVariableModel
  extends TreeNode<ServerVariableModelParent>,
    SpecificationExtensionsModel {
  readonly enum: ReadonlySet<string>;
  default: string;
  description: Nullable<CommonMarkString>;

  addEnum(...values: string[]): void;
  deleteEnumValue(...values: string[]): void;
  clearEnumValues(): void;
}

export type ServerModelParent = OpenAPIModel | PathItemModel | OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#server-object
 */
export interface ServerModel extends TreeNode<ServerModelParent>, SpecificationExtensionsModel {
  url: string;
  description: Nullable<CommonMarkString>;
  readonly variables: ReadonlyMap<string, ServerVariableModel>;

  getVariable(name: string): ServerVariableModel | undefined;
  getVariableOrThrow(name: string): ServerVariableModel;
  setVariableDefault(name: string, value: string): void;
}

export type ExternalDocumentationModelParent =
  | OpenAPIModel
  | OperationModel
  | SchemaModel
  | TagModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#external-documentation-object
 */
export interface ExternalDocumentationModel
  extends TreeNode<ExternalDocumentationModelParent>,
    SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
  url: URLString;
}

export type ParameterModelParent = ComponentsModel | PathItemModel | OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface ParameterBaseModel
  extends TreeNode<ParameterModelParent>,
    SpecificationExtensionsModel {
  name: string;
  description: Nullable<CommonMarkString>;
  deprecated: boolean;
  explode: boolean;
  schema: Nullable<SchemaModel>;
  example: Nullable<JSONValue>;
  readonly examples: ReadonlyMap<string, ExampleModel>;
  readonly content: ReadonlyMap<MIMETypeString, MediaTypeModel>;

  getExample(name: string): ExampleModel | undefined;
  getExampleOrThrow(name: string): ExampleModel;
  setExampleModel(name: string, model: ExampleModel): void;
  setExample(name: string): ExampleModel;
  deleteExample(name: string): void;
  clearExamples(): void;

  getContent(mimeType: MIMETypeString): MediaTypeModel | undefined;
  getContentOrThrow(mimeType: MIMETypeString): MediaTypeModel;
  setContentModel(mimeType: MIMETypeString, model: MediaTypeModel): void;
  setContent(mimeType: MIMETypeString): MediaTypeModel;
  deleteContent(mimeType: MIMETypeString): void;
  clearContent(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface PathParameterModel extends ParameterBaseModel {
  readonly in: 'path';
  readonly required: true;
  style: PathParameterSerializationStyle;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface QueryParameterModel extends ParameterBaseModel {
  readonly in: 'query';
  required: boolean;
  allowEmptyValue: boolean;
  style: QueryParameterSerializationStyle;
  allowReserved: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface HeaderParameterModel extends ParameterBaseModel {
  readonly in: 'header';
  required: boolean;
  style: HeaderParameterSerializationStyle;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface CookieParameterModel extends ParameterBaseModel {
  readonly in: 'cookie';
  required: boolean;
  style: CookieParameterSerializationStyle;
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

export type ExampleModelParent = ComponentsModel | MediaTypeModel | ParameterModel | HeaderModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#example-object
 */
export interface ExampleModel extends TreeNode<ExampleModelParent>, SpecificationExtensionsModel {
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;
  value: JSONValue;
  externalValue: Nullable<string>;
}

export type HeaderModelParent = ComponentsModel | ResponseModel | EncodingModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#header-object
 */
export interface HeaderModel extends TreeNode<HeaderModelParent>, SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
  required: boolean;
  deprecated: boolean;
  style: HeaderParameterSerializationStyle;
  explode: boolean;
  schema: Nullable<SchemaModel>;
  example: JSONValue;
  readonly examples: Map<string, ExampleModel>;
  readonly content: Map<MIMETypeString, MediaTypeModel>;

  getExample(name: string): ExampleModel | undefined;
  getExampleOrThrow(name: string): ExampleModel;
  setExample(name: string): ExampleModel;
  deleteExample(name: string): void;
  clearExamples(): void;

  getContent(mimeType: MIMETypeString): MediaTypeModel | undefined;
  getContentOrThrow(mimeType: MIMETypeString): MediaTypeModel;
  setContent(mimeType: MIMETypeString): void;
  deleteContent(mimeType: MIMETypeString): void;
  clearContents(): void;
}

export type EncodingModelParent = MediaTypeModel;

export type EncodingSerializationStyle = 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#encoding-object
 */
export interface EncodingModel extends TreeNode<EncodingModelParent>, SpecificationExtensionsModel {
  contentType: Nullable<string>;
  readonly headers: ReadonlyMap<string, HeaderModel>;
  style: Nullable<EncodingSerializationStyle>;
  explode: boolean;
  allowReserved: boolean;

  getHeader(name: string): HeaderModel | undefined;
  getHeaderOrThrow(name: string): HeaderModel;
  setHeader(name: string): HeaderModel;
  deleteHeader(name: string): void;
  clearHeaders(): void;
}

export type MediaTypeModelParent = ParameterModel | RequestBodyModel | ResponseModel | HeaderModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#media-type-object
 */
export interface MediaTypeModel
  extends TreeNode<MediaTypeModelParent>,
    SpecificationExtensionsModel {
  schema: Nullable<SchemaModel>;
  example: JSONValue;
  readonly examples: ReadonlyMap<string, ExampleModel>;
  readonly encoding: ReadonlyMap<string, EncodingModel>;

  setSchema(type: SchemaCreateType): SchemaModel;
  deleteSchema(): void;

  getExample(key: string): ExampleModel | undefined;
  getExampleOrThrow(key: string): ExampleModel;
  setExample(key: string): ExampleModel;
  deleteExample(key: string): void;
  clearExamples(): void;

  getEncoding(key: string): EncodingModel | undefined;
  getEncodingOrThrow(key: string): EncodingModel;
  setEncoding(key: string): EncodingModel;
  deleteEncoding(key: string): void;
  clearEncodings(): void;
}

export type RequestBodyModelParent = ComponentsModel | OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#request-body-object
 */
export interface RequestBodyModel
  extends TreeNode<RequestBodyModelParent>,
    SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
  readonly content: ReadonlyMap<MIMETypeString, MediaTypeModel>;
  required: boolean;

  getContent(mimeType: MIMETypeString): MediaTypeModel | undefined;
  getContentOrThrow(mimeType: MIMETypeString): MediaTypeModel;
  setContent(mimeType: MIMETypeString): MediaTypeModel;
  deleteContent(mimeType: MIMETypeString): void;
  clearContent(): void;
}

export type ResponseModelParent = ComponentsModel | ResponsesModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#response-object
 */
export interface ResponseModel extends TreeNode<ResponseModelParent>, SpecificationExtensionsModel {
  description: CommonMarkString;
  readonly headers: ReadonlyMap<string, HeaderModel>; // key = HTTP header name
  readonly content: ReadonlyMap<MIMETypeString, MediaTypeModel>; // key = MIME media type
  readonly links: ReadonlyMap<string, LinkModel>; // key = short name of the link

  getHeader(name: string): HeaderModel | undefined;
  getHeaderOrThrow(name: string): HeaderModel;
  setHeader(name: string): HeaderModel;
  deleteHeader(name: string): void;
  clearHeaders(): void;

  getContent(mimeType: MIMETypeString): MediaTypeModel | undefined;
  getContentOrThrow(mimeType: MIMETypeString): MediaTypeModel;
  setContent(mimeType: MIMETypeString): MediaTypeModel;
  deleteContent(mimeType: MIMETypeString): void;
  clearContent(): void;

  getLink(key: string): LinkModel | undefined;
  getLinkOrThrow(key: string): LinkModel;
  setLink(key: string): LinkModel;
  deleteLink(key: string): void;
  clearLinks(): void;
}

export type HTTPStatusCode = number | string;

export type ResponsesModelParent = OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#responses-object
 */
export interface ResponsesModel
  extends TreeNode<ResponsesModelParent>,
    SpecificationExtensionsModel {
  default: Nullable<ResponseModel>;
  readonly codes: ReadonlyMap<HTTPStatusCode, ResponseModel>;

  setDefaultResponse(description: CommonMarkString): ResponseModel;
  deleteDefaultResponse(): void;

  getResponse(code: HTTPStatusCode): ResponseModel | undefined;
  getResponseOrThrow(code: HTTPStatusCode): ResponseModel;
  setResponse(code: HTTPStatusCode, description: CommonMarkString): ResponseModel;
  deleteResponse(code: HTTPStatusCode): void;
  clearResponses(): void;
}

export type OperationModelParent = PathItemModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#operation-object
 */
export interface OperationModel
  extends TreeNode<OperationModelParent>,
    SpecificationExtensionsModel {
  readonly tags: ReadonlyArray<string>;
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;
  externalDocumentation: Nullable<ExternalDocumentationModel>;
  operationId: Nullable<string>;
  readonly parameters: ReadonlyArray<ParameterModel>;
  requestBody: Nullable<RequestBodyModel>;
  readonly responses: ResponsesModel;
  readonly callbacks: ReadonlyMap<string, CallbackModel>;
  deprecated: boolean;
  readonly security: ReadonlyArray<SecurityRequirementModel>;
  readonly servers: ReadonlyArray<ServerModel>;

  /**
   * HTTP method this operation is associated with, within its path item.
   */
  readonly httpMethod: PathItemOperationKey;

  addTag(name: string): void;
  deleteTag(name: string): void;
  deleteTagAt(index: number): void;
  clearTags(): void;

  getParameter(name: string, source: ParameterLocation): ParameterModel | undefined;
  getParameterOrThrow(name: string, source: ParameterLocation): ParameterModel;
  addParameter(name: string, source: 'path'): PathParameterModel;
  addParameter(name: string, source: 'query'): QueryParameterModel;
  addParameter(name: string, source: 'header'): HeaderParameterModel;
  addParameter(name: string, source: 'cookie'): CookieParameterModel;
  deleteParameter(name: string): void;
  clearParameters(): void;

  setRequestBody(): RequestBodyModel;
  deleteRequestBody(): void;

  setDefaultResponse(description: CommonMarkString): ResponseModel;
  deleteDefaultResponse(): void;

  getResponse(code: HTTPStatusCode): ResponseModel | undefined;
  getResponseOrThrow(code: HTTPStatusCode): ResponseModel;
  setResponse(code: HTTPStatusCode, description: CommonMarkString): ResponseModel;
  deleteResponse(code: HTTPStatusCode): void;
  clearResponses(): void;

  getCallback(name: string): CallbackModel | undefined;
  getCallbackOrThrow(name: string): CallbackModel;
  setCallback(key: string): CallbackModel;
  deleteCallback(key: string): void;
  clearCallbacks(): void;

  addSecurityRequirement(): SecurityRequirementModel;
  deleteSecurityRequirementAt(index: number): void;
  clearSecurityRequirements(): void;

  getServer(url: ParametrisedURLString): ServerModel | undefined;
  getServerOrThrow(url: ParametrisedURLString): ServerModel;
  addServer(url: string): ServerModel;
  deleteServer(url: string): void;
  deleteServerAt(index: number): void;
  clearServers(): void;
}

export type PathItemOperationKey = Exclude<Lowercase<HTTPMethod>, 'connect'>;

export type PathItemModelParent = PathsModel | CallbackModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#paths-object
 */
export interface PathItemModel extends TreeNode<PathItemModelParent>, SpecificationExtensionsModel {
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
  readonly servers: ServerModel[];
  readonly parameters: ParameterModel[];

  /**
   * URL associated with this path item in item's parent collection.
   */
  readonly pathUrl: ParametrisedURLString;

  /**
   * Returns operation associated with given HTTP method. Returns undefined
   * if there is no such an operation.
   */
  getOperation(key: PathItemOperationKey): OperationModel | undefined;

  /**
   * Returns operation associated with given HTTP method. Throws an exception
   * if there is no such an operation.
   */
  getOperationOrThrow(key: PathItemOperationKey): OperationModel;

  /**
   * Returns HTTP method, associated with given operation. If the operation does
   * not belong to this path item, returns undefined.
   */
  getOperationKey(operation: OperationModel): PathItemOperationKey | undefined;

  /**
   * Returns HTTP method, associated with given operation. If the operation does
   * not belong to this path item, throws an error.
   */
  getOperationKeyOrThrow(operation: OperationModel): PathItemOperationKey;

  operations(): IterableIterator<[PathItemOperationKey, OperationModel]>;

  setOperation(method: PathItemOperationKey): OperationModel;
  removeOperation(method: PathItemOperationKey): void;
  clearOperations(): void;

  addServer(url: string): ServerModel;
  deleteServer(url: string): void;
  deleteServerAt(index: number): void;
  clearServers(): void;

  addParameterModel(model: ParameterModel): void;
}

export type PathsModelParent = OpenAPIModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#paths-object
 */
export interface PathsModel
  extends TreeNode<PathsModelParent>,
    Map<ParametrisedURLString, PathItemModel>,
    SpecificationExtensionsModel {
  getItem(url: ParametrisedURLString): PathItemModel | undefined;
  getItemOrThrow(url: ParametrisedURLString): PathItemModel;

  /**
   * Returns an URL associated with given path item. If the item is not
   * in this paths collection, return undefined.
   */
  getItemUrl(pathItem: PathItemModel): ParametrisedURLString | undefined;

  /**
   * Returns an URL associated with given path item. If the item is not
   * in this paths collection, throws an exception.
   */
  getItemUrlOrThrow(pathItem: PathItemModel): ParametrisedURLString;
}

export type SecuritySchemaModelParent = ComponentsModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface SecuritySchemaBaseModel
  extends TreeNode<SecuritySchemaModelParent>,
    SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface APIKeySecuritySchemaModel extends SecuritySchemaBaseModel {
  readonly type: 'apiKey';
  name: string;
  in: 'query' | 'header' | 'cookie';
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface HTTPSecuritySchemaModel extends SecuritySchemaBaseModel {
  readonly type: 'http';
  description: Nullable<CommonMarkString>;
  scheme: SchemaModel;
  bearerFormat: Nullable<string>;
}

export type OAuthFlowModelParent = OAuthFlowsModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
interface OAuthFlowBaseModel extends TreeNode<OAuthFlowModelParent>, SpecificationExtensionsModel {
  refreshUrl: Nullable<URLString>;
  readonly scopes: ReadonlyMap<string, string>;

  getScope(key: string): string | undefined;
  getScopeOrThrow(key: string): string;
  setScope(key: string, value: string): void;
  deleteScope(key: string): void;
  clearScopes(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export interface OAuthImplicitFlowModel extends OAuthFlowBaseModel {
  readonly type: 'implicit';
  authorizationUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export interface OAuthPasswordFlowModel extends OAuthFlowBaseModel {
  readonly type: 'password';
  tokenUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export interface OAuthClientCredentialsFlowModel extends OAuthFlowBaseModel {
  readonly type: 'clientCredentials';
  tokenUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 */
export interface OAuthAuthorizationCodeFlowModel extends OAuthFlowBaseModel {
  readonly type: 'authorizationCode';
  authorizationUrl: URLString;
  tokenUrl: URLString;
}

export type OAuthFlowModel =
  | OAuthImplicitFlowModel
  | OAuthPasswordFlowModel
  | OAuthClientCredentialsFlowModel
  | OAuthAuthorizationCodeFlowModel;

export type OAuthFlowType = OAuthFlowModel['type'];

export type OAuthFlowsModelParent = OAuth2SecuritySchemaModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flows-object
 */
export interface OAuthFlowsModel
  extends TreeNode<OAuthFlowsModelParent>,
    SpecificationExtensionsModel {
  implicit: Nullable<OAuthImplicitFlowModel>;
  password: Nullable<OAuthPasswordFlowModel>;
  clientCredentials: Nullable<OAuthClientCredentialsFlowModel>;
  authorizationCode: Nullable<OAuthAuthorizationCodeFlowModel>;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface OAuth2SecuritySchemaModel extends SecuritySchemaBaseModel {
  readonly type: 'oauth2';
  readonly flows: OAuthFlowsModel;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface OpenIDConnectSecuritySchemaModel extends SecuritySchemaBaseModel {
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

export type LinkModelParent = ComponentsModel | ResponseModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#link-object
 */
export interface LinkModel extends TreeNode<LinkModelParent>, SpecificationExtensionsModel {
  operationRef: Nullable<string>;
  operationId: Nullable<string>;
  readonly parameters: ReadonlyMap<string, JSONValue>;
  requestBody: JSONValue;
  description: Nullable<CommonMarkString>;
  server: Nullable<ServerModel>;

  getParameter(key: string): JSONValue | undefined;
  getParameterOrThrow(key: string): JSONValue;
  setParameter(key: string, value: JSONValue): void;
  deleteParameter(key: string): void;
  clearParameters(): void;
}

export type CallbackModelParent = ComponentsModel | OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#callback-object
 */
export interface CallbackModel extends TreeNode<CallbackModelParent>, SpecificationExtensionsModel {
  readonly paths: ReadonlyMap<ParametrisedURLString, PathItemModel>;

  getPathItem(key: ParametrisedURLString): PathItemModel | undefined;
  getPathItemOrThrow(key: ParametrisedURLString): PathItemModel;
  setPathItem(key: ParametrisedURLString): PathItemModel;
  deletePathItem(key: ParametrisedURLString): void;
  clearPathItems(): void;

  /**
   * Returns an URL associated with given path item. If the item is not
   * in this paths collection, return undefined.
   */
  getItemUrl(pathItem: PathItemModel): ParametrisedURLString | undefined;

  /**
   * Returns an URL associated with given path item. If the item is not
   * in this paths collection, throws an exception.
   */
  getItemUrlOrThrow(pathItem: PathItemModel): ParametrisedURLString;
}

export type ComponentsModelParent = OpenAPIModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#components-object
 */
export interface ComponentsModel
  extends TreeNode<ComponentsModelParent>,
    SpecificationExtensionsModel {
  readonly schemas: ReadonlyMap<string, SchemaModel>;
  readonly responses: ReadonlyMap<string, ResponseModel>;
  readonly parameters: ReadonlyMap<string, ParameterModel>;
  readonly examples: ReadonlyMap<string, ExampleModel>;
  readonly requestBodies: ReadonlyMap<string, RequestBodyModel>;
  readonly headers: ReadonlyMap<string, HeaderModel>;
  readonly securitySchemes: ReadonlyMap<string, SecuritySchemaModel>;
  readonly links: ReadonlyMap<string, LinkModel>;
  readonly callbacks: ReadonlyMap<string, CallbackModel>;

  isEmpty(): boolean;

  getSchema(name: string): SchemaModel | undefined;
  getSchemaOrThrow(name: string): SchemaModel;
  setSchemaModel(name: string, model: SchemaModel): void;
  setSchema(name: string, type?: SchemaType): SchemaModel;
  deleteSchema(name: string): void;
  clearSchemas(): void;

  getResponse(name: string): ResponseModel | undefined;
  getResponseOrThrow(name: string): ResponseModel;
  setResponseModel(name: string, model: ResponseModel): void;
  setResponse(name: string, description: CommonMarkString): ResponseModel;
  deleteResponse(name: string): void;
  clearResponses(): void;

  getParameter(name: string): ParameterModel | undefined;
  getParameterOrThrow(name: string): ParameterModel;
  setParameterModel(name: string, model: ParameterModel): void;
  setParameter(name: string, kind: ParameterModel['in'], paramName: string): ParameterModel;
  deleteParameter(name: string): void;
  clearParameters(): void;

  getExample(name: string): ExampleModel | undefined;
  getExampleOrThrow(name: string): ExampleModel;
  setExampleModel(name: string, model: ExampleModel): void;
  setExample(name: string): ExampleModel;
  deleteExample(name: string): void;
  clearExamples(): void;

  getRequestBody(name: string): RequestBodyModel | undefined;
  getRequestBodyOrThrow(name: string): RequestBodyModel;
  setRequestBodyModel(name: string, model: RequestBodyModel): void;
  setRequestBody(name: string): RequestBodyModel;
  deleteRequestBody(name: string): void;
  clearRequestBodies(): void;

  getHeader(name: string): HeaderModel | undefined;
  getHeaderOrThrow(name: string): HeaderModel;
  setHeaderModel(name: string, model: HeaderModel): void;
  setHeader(name: string): HeaderModel;
  deleteHeader(name: string): void;
  clearHeaders(): void;

  getSecuritySchema(name: string): SecuritySchemaModel | undefined;
  getSecuritySchemaOrThrow(name: string): SecuritySchemaModel;
  setSecuritySchemaModel(name: string, model: SecuritySchemaModel): void;
  setSecuritySchema(name: string, kind: SecuritySchemaModel['type']): SecuritySchemaModel;
  deleteSecuritySchema(name: string): void;
  clearSecuritySchemes(): void;

  getLink(name: string): LinkModel | undefined;
  getLinkOrThrow(name: string): LinkModel;
  setLinkModel(name: string, model: LinkModel): void;
  setLink(name: string): LinkModel;
  deleteLink(name: string): void;
  clearLinks(): void;

  getCallback(name: string): CallbackModel | undefined;
  getCallbackOrThrow(name: string): CallbackModel;
  setCallbackModel(name: string, model: CallbackModel): void;
  setCallback(name: string): CallbackModel;
  deleteCallback(name: string): void;
  clearCallbacks(): void;
}

export type SecurityRequirementModelParent = OpenAPIModel | OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-requirement-object
 */
export interface SecurityRequirementModel
  extends TreeNode<SecurityRequirementModelParent>,
    SpecificationExtensionsModel {
  readonly scopes: ReadonlyMap<string, ReadonlyArray<string>>;

  getScopes(schemeName: string): string[] | undefined;
  getScopesOrThrow(schemeName: string): string[];
  addScopes(schemeName: string, ...scope: string[]): void;
  deleteScopes(schemeName: string, ...scope: string[]): void;
  clearScopes(): void;
}

export type TagModelParent = OpenAPIModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#tag-object
 */
export interface TagModel extends TreeNode<TagModelParent>, SpecificationExtensionsModel {
  name: string;
  description: Nullable<CommonMarkString>;
  externalDocs: Nullable<ExternalDocumentationModel>;
}

export type XMLModelParent = SchemaModel;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#xml-object
 */
export interface XMLModel extends TreeNode<XMLModelParent>, SpecificationExtensionsModel {
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
  readonly root: OpenAPIModel;
  readonly openapi: OpenApiVersion;
  readonly info: InfoModel;
  readonly servers: ReadonlyArray<ServerModel>; // by default it contains a server with '/' url
  readonly paths: PathsModel;
  readonly components: ComponentsModel;
  readonly security: ReadonlyArray<SecurityRequirementModel>;
  readonly tags: ReadonlyArray<TagModel>;
  readonly externalDocs: Nullable<ExternalDocumentationModel>;

  getServer(url: ParametrisedURLString): ServerModel | undefined;
  getServerOrThrow(url: ParametrisedURLString): ServerModel;
  addServer(
    url: ParametrisedURLString,
    variableDefaults?: Record<string, string>,
    description?: CommonMarkString,
  ): ServerModel;
  removeServerAt(index: number): void;
  clearServers(): void;

  getPathItem(url: ParametrisedURLString): PathItemModel | undefined;
  getPathItemOrThrow(url: ParametrisedURLString): PathItemModel;
  setPathItem(url: ParametrisedURLString): PathItemModel;
  deletePathItem(url: ParametrisedURLString): void;
  clearPathItems(): void;

  addSecurityRequirement(): SecurityRequirementModel;
  deleteSecurityRequirementAt(index: number): void;
  clearSecurityRequirements(): void;

  getTag(name: string): TagModel | undefined;
  getTagOrThrow(name: string): TagModel;
  addTag(name: string): TagModel;
  deleteTag(name: string): void;
  deleteTagAt(index: number): void;
  clearTags(): void;
}

export interface OpenAPIModelFactory {
  create(): OpenAPIModel;
  create(title: string, version: string): OpenAPIModel;
}

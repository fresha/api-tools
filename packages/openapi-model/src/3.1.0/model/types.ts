import {
  CookieParameterSerializationStyle,
  HeaderParameterSerializationStyle,
  PathParameterSerializationStyle,
  QueryParameterSerializationStyle,
} from '../../baseTypes';

import type {
  CommonMarkString,
  HTTPStatusCode,
  JSONValue,
  MIMETypeString,
  Nullable,
  ParametrisedURLString,
  URLString,
} from '@fresha/api-tools-core';

export type ExtensionFields = ReadonlyMap<string, JSONValue>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#specification-extensions
 */
export interface SpecificationExtensionsModel {
  readonly extensionCount: number;
  extensions(): IterableIterator<[string, JSONValue]>;
  extensionKeys(): IterableIterator<string>;
  hasExtension(key: string): boolean;
  getExtension(key: string): JSONValue;
  setExtension(key: string, value: JSONValue): void;
  deleteExtension(key: string): void;
  clearExtensions(): void;
}

export interface OpenAPIModelFactory {
  create(): OpenAPIModel;
  create(title: string, version: string): OpenAPIModel;
}

export type OpenAPIVersion = '3.1.0';

/**
 * @see https://spec.openapis.org/oas/v3.1.0#openapi-object
 */
export interface OpenAPIModel extends SpecificationExtensionsModel {
  readonly root: OpenAPIModel;
  readonly openapi: OpenAPIVersion;
  readonly info: InfoModel;
  readonly jsonSchemaDialect: string;

  readonly serverCount: number;
  servers(): IterableIterator<ServerModel>;
  serverAt(index: number): ServerModel;
  addServer(url: string): ServerModel;
  removeServerAt(index: number): void;
  clearServers(): void;

  readonly paths: PathsModel;

  readonly webhookCount: number;
  webhookKeys(): IterableIterator<string>;
  webhooks(): IterableIterator<[string, PathItemModel]>;
  hasWebhook(key: string): boolean;
  getWebhook(key: string): PathItemModel;
  addWebhook(key: string): PathItemModel;
  removeWebhook(key: string): void;
  clearWebhooks(): void;

  readonly components: ComponentsModel;

  readonly securityRequirementCount: number;
  securityRequirements(): IterableIterator<SecurityRequirementModel>;
  securityRequirementAt(index: number): SecurityRequirementModel;
  addSecurityRequirement(): SecurityRequirementModel;
  deleteSecurityRequirementAt(index: number): void;
  clearSecurityRequirements(): void;

  readonly tagCount: number;
  tags(): IterableIterator<TagModel>;
  tagAt(index: number): TagModel;
  hasTag(name: string): boolean;
  addTag(name: string): TagModel;
  deleteTagAt(index: number): void;
  clearTags(): void;

  readonly externalDocs: Nullable<ExternalDocumentationModel>;
  addExternalDocs(url: string): ExternalDocumentationModel;
  deleteExternalDocs(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#info-object
 */
export interface InfoModel extends SpecificationExtensionsModel {
  title: string;
  description: Nullable<CommonMarkString>;
  termsOfService: Nullable<string>;
  readonly contact: ContactModel;
  readonly license: LicenseModel;
  version: string;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#contact-object
 */
export interface ContactModel extends SpecificationExtensionsModel {
  name: Nullable<string>;
  url: Nullable<string>;
  email: Nullable<string>;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#license-object
 */
export interface LicenseModel extends SpecificationExtensionsModel {
  name: string;
  url: Nullable<string>;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#server-object
 */
export interface ServerModel extends SpecificationExtensionsModel {
  url: string;
  description: Nullable<CommonMarkString>;

  readonly variableCount: number;
  variables(): IterableIterator<ServerVariableModel>;
  variableNames(): IterableIterator<string>;
  hasVariable(name: string): boolean;
  getVariable(name: string): ServerVariableModel;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#server-variable-object
 */
export interface ServerVariableModel extends SpecificationExtensionsModel {
  readonly allowedValueCount: number;
  allowedValues(): IterableIterator<string>;
  hasAllowedValue(value: string): boolean;
  addAllowedValue(value: string): void;
  removeAllowedValue(value: string): void;
  clearAllowedValues(): void;

  defaultValue: string;
  description: Nullable<CommonMarkString>;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#paths-object
 */
export interface PathsModel extends SpecificationExtensionsModel {
  readonly itemCount: number;
  itemUrls(): IterableIterator<ParametrisedURLString>;
  items(): IterableIterator<[ParametrisedURLString, PathItemModel]>;
  hasItem(url: ParametrisedURLString): boolean;
  addItem(url: ParametrisedURLString): PathItemModel;
  removeItem(url: ParametrisedURLString): void;
  clearItems(): void;
}

export type PathItemOperationMethod =
  | 'get'
  | 'put'
  | 'post'
  | 'delete'
  | 'options'
  | 'head'
  | 'patch'
  | 'trace';

/**
 * @see https://spec.openapis.org/oas/v3.1.0#path-item-object
 */
export interface PathItemModel extends SpecificationExtensionsModel {
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;

  readonly operationCount: number;
  operationMethods(): IterableIterator<PathItemOperationMethod>;
  operations(): IterableIterator<[PathItemOperationMethod, OperationModel]>;
  hasOperation(method: PathItemOperationMethod): boolean;
  getOperation(method: PathItemOperationMethod): OperationModel;
  addOperation(method: PathItemOperationMethod): OperationModel;
  removeOperation(method: PathItemOperationMethod): void;
  clearOperations(): void;

  readonly serverCount: number;
  servers(): IterableIterator<ServerModel>;
  serverAt(index: number): ServerModel;
  addServer(url: string): ServerModel;
  removeServerAt(index: number): void;
  clearServers(): void;

  readonly parameterCount: number;
  parameters(): IterableIterator<ParameterModel>;
  parameterAt(index: number): ParameterModel;
  removeParameterAt(index: number): void;
  hasParameter(name: string, location?: ParameterLocation): boolean;
  getParameter(name: string, location?: ParameterLocation): ParameterModel;
  addParameter(name: string, location: 'path'): PathParameterModel;
  addParameter(name: string, location: 'query'): QueryParameterModel;
  addParameter(name: string, location: 'header'): HeaderParameterModel;
  addParameter(name: string, location: 'cookie'): CookieParameterModel;
  removeParameter(name: string, location?: ParameterLocation): void;
  clearParameters(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
export interface ParameterModelBase extends SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
  deprecated: boolean;
  explode: boolean;

  readonly schema: Nullable<SchemaModel>;
  addSchema(): SchemaModel;
  deleteSchema(): void;

  readonly exampleCount: number;
  exampleKeys(): IterableIterator<string>;
  examples(): IterableIterator<[string, ExampleModel]>;
  hasExample(key: string): boolean;
  addExample(key: string): ExampleModel;
  deleteExample(key: string): void;
  clearExamples(): void;

  readonly mediaTypeCount: number;
  mediaTypeKeys(): IterableIterator<MIMETypeString>;
  mediaTypes(): IterableIterator<[MIMETypeString, MediaTypeModel]>;
  hasMediaType(mediaType: MIMETypeString): boolean;
  addMediaType(mediaType: MIMETypeString): MediaTypeModel;
  deleteMediaType(mediaType: MIMETypeString): void;
  clearMediaTypes(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
export interface PathParameterModel extends ParameterModelBase {
  readonly in: 'path';
  readonly name: string;
  readonly required: true;
  style: PathParameterSerializationStyle;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
export interface QueryParameterModel extends ParameterModelBase {
  readonly in: 'query';
  name: string;
  required: boolean;
  allowEmptyValue: boolean;
  style: QueryParameterSerializationStyle;
  allowReserved: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
export interface HeaderParameterModel extends ParameterModelBase {
  readonly in: 'header';
  name: string;
  required: boolean;
  style: HeaderParameterSerializationStyle;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
export interface CookieParameterModel extends ParameterModelBase {
  readonly in: 'cookie';
  name: string;
  required: boolean;
  style: CookieParameterSerializationStyle;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
export type ParameterModel =
  | PathParameterModel
  | QueryParameterModel
  | HeaderParameterModel
  | CookieParameterModel;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
export type ParameterLocation = ParameterModel['in'];

/**
 * @see https://spec.openapis.org/oas/v3.1.0#media-type-object
 */
export interface MediaTypeModel extends SpecificationExtensionsModel {
  readonly schema: Nullable<SchemaModel>;
  addSchema(): SchemaModel;
  deleteSchema(): void;

  readonly exampleCount: number;
  exampleKeys(): IterableIterator<string>;
  examples(): IterableIterator<[string, ExampleModel]>;
  hasExample(key: string): boolean;
  addExample(key: string): ExampleModel;
  deleteExample(key: string): void;
  clearExamples(): void;

  readonly encodingCount: number;
  encodingKeys(): IterableIterator<string>;
  encodings(): IterableIterator<[string, EncodingModel]>;
  hasEncoding(key: string): boolean;
  addEncoding(key: string): EncodingModel;
  deleteEncoding(key: string): void;
  clearEncodings(): void;
}

export type EncodingSerializationStyle = 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#encoding-object
 */
export interface EncodingModel extends SpecificationExtensionsModel {
  contentType: Nullable<string>;

  readonly headerCount: number;
  headerNames(): IterableIterator<string>;
  headers(): IterableIterator<[string, HeaderModel]>;
  hasHeader(name: string): boolean;
  addHeader(name: string): HeaderModel;
  deleteHeader(name: string): void;
  clearHeaders(): void;

  style: Nullable<EncodingSerializationStyle>;
  explode: boolean;
  allowReserved: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#operation-object
 */
export interface OperationModel extends SpecificationExtensionsModel {
  readonly tagCount: number;
  tagNames(): IterableIterator<string>;
  tags(): IterableIterator<TagModel>;
  tagAt(index: number): TagModel;
  removeTagAt(index: number): void;
  hasTag(name: string): boolean;
  addTag(name: string): void;
  removeTag(name: string): void;
  clearTags(): void;

  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;

  readonly externalDocs: Nullable<ExternalDocumentationModel>;
  addExternalDocs(url: URLString): ExternalDocumentationModel;
  deleteExternalDocs(): void;

  operationId: Nullable<string>;

  readonly parameterCount: number;
  parameters(): IterableIterator<ParameterModel>;
  parameterAt(index: number): ParameterModel;
  removeParameterAt(index: number): void;
  hasParameter(name: string, location?: ParameterLocation): boolean;
  getParameter(name: string, location?: ParameterLocation): ParameterModel;
  addParameter(name: string, location: 'path'): PathParameterModel;
  addParameter(name: string, location: 'query'): QueryParameterModel;
  addParameter(name: string, location: 'header'): HeaderParameterModel;
  addParameter(name: string, location: 'cookie'): CookieParameterModel;
  removeParameter(name: string, location?: ParameterLocation): void;
  clearParameters(): void;

  readonly requestBody: Nullable<RequestBodyModel>;
  addRequestBody(): RequestBodyModel;
  deleteRequestBody(): void;

  readonly responses: ResponsesModel;

  readonly callbackCount: number;
  callbackKeys(): IterableIterator<string>;
  callbacks(): IterableIterator<[string, CallbackModel]>;
  hasCallback(key: string): boolean;
  getCallback(key: string): CallbackModel;
  addCallback(key: string): CallbackModel;
  deleteCallback(key: string): void;
  clearCallbacks(): void;

  deprecated: boolean;

  readonly securityRequirementCount: number;
  securityRequirements(): IterableIterator<SecurityRequirementModel>;
  securityRequirementAt(index: number): SecurityRequirementModel;
  addSecurityRequirement(): SecurityRequirementModel;
  deleteSecurityRequirementAt(index: number): void;
  clearSecurityRequirements(): void;

  readonly serverCount: number;
  servers(): IterableIterator<ServerModel>;
  serverAt(index: number): ServerModel;
  hasServer(url: string): boolean;
  addServer(url: string): ServerModel;
  removeServerAt(index: number): void;
  clearServers(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#sequrity-requirement-object
 */
export interface SecurityRequirementModel extends SpecificationExtensionsModel {
  readonly schemaCount: number;
  schemas(): IterableIterator<SecuritySchemaModel>;
  scopeCount(schema: SecuritySchemaModel): number;
  scopes(schema: SecuritySchemaModel): IterableIterator<string>;
  hasScope(schema: SecuritySchemaModel): boolean;
  addScope(schema: SecuritySchemaModel, scope: string): void;
  deleteScope(schema: SecuritySchemaModel, scope: string): void;
  clearScopes(schema: SecuritySchemaModel): void;
  clearAllScopes(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#tag-object
 */
export interface TagModel extends SpecificationExtensionsModel {
  name: string;
  description: Nullable<CommonMarkString>;

  readonly externalDocs: Nullable<ExternalDocumentationModel>;
  addExternalDocs(url: URLString): ExternalDocumentationModel;
  deleteExternalDocs(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#external-documentation-object
 */
export interface ExternalDocumentationModel extends SpecificationExtensionsModel {
  url: URLString;
  description: Nullable<CommonMarkString>;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#request-body-object
 */
export interface RequestBodyModel extends SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;

  readonly mediaTypeCount: number;
  mediaTypeKeys(): IterableIterator<MIMETypeString>;
  mediaTypes(): IterableIterator<[MIMETypeString, MediaTypeModel]>;
  hasMediaType(mediaType: MIMETypeString): boolean;
  addMediaType(mediaType: MIMETypeString): MediaTypeModel;
  deleteMediaType(mediaType: MIMETypeString): void;
  clearMediaTypes(): void;

  required: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#components-object
 */
export interface ResponsesModel extends SpecificationExtensionsModel {
  readonly defaultResponse: Nullable<ResponseModel>;
  addDefaultResponse(description: CommonMarkString): ResponseModel;
  deleteDefaultResponse(): void;

  readonly responseCount: number;
  responseCodes(): IterableIterator<HTTPStatusCode>;
  responses(): IterableIterator<[HTTPStatusCode, ResponseModel]>;
  hasResponse(code: HTTPStatusCode): boolean;
  getResponse(code: HTTPStatusCode): ResponseModel;
  addResponse(code: HTTPStatusCode, description: CommonMarkString): ResponseModel;
  deleteResponse(code: HTTPStatusCode): void;
  clearResponses(): void;
}

export type CallbackModel = SpecificationExtensionsModel;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#components-object
 */
export interface ComponentsModel extends SpecificationExtensionsModel {
  readonly schemaCount: number;
  schemaKeys(): IterableIterator<string>;
  schemas(): IterableIterator<[string, SchemaModel]>;
  hasSchema(key: string): boolean;
  addSchema(key: string): SchemaModel;
  deleteSchema(key: string): void;
  clearSchemas(): void;

  readonly responseCount: number;
  responseKeys(): IterableIterator<string>;
  responses(): IterableIterator<[string, ResponseModel]>;
  hasResponse(key: string): boolean;
  addResponse(key: string, description: CommonMarkString): ResponseModel;
  deleteResponse(key: string): void;
  clearResponse(): void;

  readonly parameterCount: number;
  parameterKeys(): IterableIterator<string>;
  parameters(): IterableIterator<[string, ParameterModel]>;
  hasParameter(key: string): boolean;
  addParameter(key: string, name: string, location: 'path'): PathParameterModel;
  addParameter(key: string, name: string, location: 'query'): QueryParameterModel;
  addParameter(key: string, name: string, location: 'header'): HeaderParameterModel;
  addParameter(key: string, name: string, location: 'cookie'): CookieParameterModel;
  deleteParameter(key: string): void;
  clearParameters(): void;

  readonly exampleCount: number;
  exampleKeys(): IterableIterator<string>;
  examples(): IterableIterator<[string, ExampleModel]>;
  hasExample(key: string): boolean;
  addExample(key: string): ExampleModel;
  deleteExample(key: string): void;
  clearExamples(): void;

  readonly requestBodyCount: number;
  requestBodyKeys(): IterableIterator<string>;
  requestBodies(): IterableIterator<[string, RequestBodyModel]>;
  hasRequestBody(key: string): boolean;
  addRequestBody(key: string): RequestBodyModel;
  deleteRequestBody(key: string): void;
  clearRequestBodies(): void;

  readonly headerCount: number;
  headerKeys(): IterableIterator<string>;
  headers(): IterableIterator<[string, HeaderModel]>;
  hasHeader(key: string): boolean;
  addHeader(key: string): HeaderModel;
  deleteHeader(key: string): void;
  clearHeaders(): void;

  readonly securitySchemaCount: number;
  securitySchemaKeys(): IterableIterator<string>;
  securitySchemas(): IterableIterator<[string, SecuritySchemaModel]>;
  hasSecuritySchema(key: string): boolean;
  addSecuritySchema(
    key: string,
    type: 'apiKey',
    name: string,
    location: APIKeySecuritySchemaLocation,
  ): APIKeySecuritySchemaModel;
  addSecuritySchema(key: string, type: 'http'): HTTPSecuritySchemaModel;
  addSecuritySchema(key: string, type: 'mutualTLS'): MutualTLSSecuritySchemaModel;
  addSecuritySchema(key: string, type: 'oauth2'): OAuth2SecuritySchemaModel;
  addSecuritySchema(
    key: string,
    type: 'openIdConnect',
    connectUrl: URLString,
  ): OpenIDConnectSecuritySchemaModel;
  deleteSecuritySchema(key: string): void;
  clearSecuritySchemas(): void;

  readonly linkCount: number;
  linkKeys(): IterableIterator<string>;
  links(): IterableIterator<[string, LinkModel]>;
  hasLink(key: string): boolean;
  addLink(key: string): LinkModel;
  deleteLink(key: string): void;
  clearLinks(): void;

  readonly callbackCount: number;
  callbackKeys(): IterableIterator<string>;
  callbacks(): IterableIterator<[string, CallbackModel]>;
  hasCallback(key: string): boolean;
  addCallback(key: string): CallbackModel;
  deleteCallback(key: string): void;
  clearCallbacks(): void;

  readonly pathItemCount: number;
  pathItemKeys(): IterableIterator<string>;
  pathItems(): IterableIterator<[string, PathItemModel]>;
  hasPathItem(key: string): boolean;
  addPathItem(key: string): PathItemModel;
  deletePathItem(key: string): void;
  clearPathItems(): void;
}

export type SchemaType = 'null' | 'boolean' | 'integer' | 'number' | 'string' | 'object' | 'array';

export type SchemaFormat =
  // JSON Schema formats
  | 'date-time'
  | 'time'
  | 'date'
  | 'duration'
  | 'email'
  | 'idn-email'
  | 'hostname'
  | 'idn-hostname'
  | 'ipv4'
  | 'ipv6'
  | 'uuid'
  | 'uri'
  | 'uri-reference'
  | 'iri'
  | 'iri-reference'
  | 'uri-template'
  | 'json-pointer'
  | 'relative-json-pointer'
  | 'regex'
  // OpenAPI formats
  | 'int32'
  | 'int64'
  | 'float'
  | 'double'
  | 'byte'
  | 'binary'
  | 'password';

/**
 * @see https://spec.openapis.org/oas/v3.1.0#schema-object
 */
export interface SchemaModel extends SpecificationExtensionsModel {
  title: Nullable<string>;
  description: Nullable<CommonMarkString>;
  defaultValue: JSONValue | undefined;

  readonly exampleCount: number;
  examples(): IterableIterator<JSONValue>;
  exampleAt(index: number): JSONValue;
  deleteExampleAt(index: number): void;
  clearExamples(): void;

  readonly typeCount: number;
  types(): IterableIterator<SchemaType>;
  hasType(value: SchemaType): boolean;
  addType(value: SchemaType): void;
  deleteType(value: SchemaType): void;
  clearTypes(): void;

  format: Nullable<SchemaFormat>;

  readonly allowedValueCount: number;
  allowedValues(): IterableIterator<JSONValue>;
  hasAllowedValue(value: JSONValue): boolean;
  addAllowedValue(value: JSONValue): void;
  removeAllowedValue(value: JSONValue): void;
  clearAllowedValues(): void;

  minLength: Nullable<number>;
  maxLength: Nullable<number>;
  pattern: Nullable<string>;

  minimum: Nullable<number>;
  exclusiveMinimum: Nullable<number>;
  maximum: Nullable<number>;
  exclusiveMaximum: Nullable<number>;
  multipleOf: Nullable<number>;

  readonly propertyCount: number;
  propertyNames(): IterableIterator<string>;
  properties(): IterableIterator<[string, SchemaModel]>;
  hasProperty(name: string): boolean;
  getProperty(name: string): SchemaModel;
  addProperty(name: string): SchemaModel;
  deleteProperty(name: string): void;
  clearProperties(): void;

  minProperties: Nullable<number>;
  maxProperties: Nullable<number>;

  readonly patternPropertyCount: number;
  patternPropertyNames(): IterableIterator<string>;
  patternProperties(): IterableIterator<[string, SchemaModel]>;
  hasPatternProperty(name: string): boolean;
  getPatternProperty(name: string): SchemaModel;
  addPatternProperty(name: string): SchemaModel;
  deletePatternProperty(name: string): void;
  clearPatternProperties(): void;

  additionalProperties: SchemaModel | false;
  addAdditionalProperties(): SchemaModel;
  disableAdditionalProperties(): void;

  requiredPropertyNames(): IterableIterator<string>;
  requiredProperties(): IterableIterator<[string, SchemaModel]>;
  isPropertyRequired(name: string): boolean;
  setPropertyRequired(name: string, value: boolean): void;

  readonly propertyNamesSchema: Nullable<SchemaModel>;
  addPropertyNamesSchema(): SchemaModel;
  deletePropertyNamesSchema(): void;

  readonly items: Nullable<SchemaModel>;
  addItems(): SchemaModel;
  deleteItems(): void;

  minItems: Nullable<number>;
  maxItems: Nullable<number>;
  uniqueItems: boolean;

  readonly containsSchema: Nullable<SchemaModel>;
  addContainsSchema(): SchemaModel;
  deleteContainsSchema(): void;

  minContains: Nullable<number>;
  maxContains: Nullable<number>;

  readonly prefixItemsCount: number;
  prefixItemsAt(index: number): SchemaModel;
  addPrefixItem(): SchemaModel;
  deletePrefixItemAt(index: number): void;
  clearPrefixItems(): void;

  readonly allOfCount: number;
  allOf(): IterableIterator<SchemaModel>;
  allOfAt(index: number): SchemaModel;
  addAllOf(): SchemaModel;
  deleteAllOfAt(index: number): void;
  clearAllOf(): void;

  readonly anyOfCount: number;
  anyOf(): IterableIterator<SchemaModel>;
  anyOfAt(index: number): SchemaModel;
  addAnyOf(): SchemaModel;
  deleteAnyOfAt(index: number): void;
  clearAnyOf(): void;

  readonly oneOfCount: number;
  oneOf(): IterableIterator<SchemaModel>;
  oneOfAt(index: number): SchemaModel;
  addOneOf(): SchemaModel;
  deleteOneOfAt(index: number): void;
  clearOneOf(): void;

  readonly not: Nullable<SchemaModel>;
  addNot(): SchemaModel;
  deleteNot(): void;

  readonly discriminator: Nullable<DiscriminatorModel>;
  addDiscriminator(propertyName: string): DiscriminatorModel;
  deleteDiscriminator(): void;

  readonly xml: Nullable<XMLModel>;
  addXML(): XMLModel;
  deleteXML(): void;

  readonly externalDocs: Nullable<ExternalDocumentationModel>;
  addExternalDocs(url: URLString): ExternalDocumentationModel;
  deleteExternalDocs(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#discriminator-object
 */
export interface DiscriminatorModel extends SpecificationExtensionsModel {
  propertyName: string;

  readonly mappingCount: number;
  mapping(): IterableIterator<[string, string]>;
  hasMapping(key: string): boolean;
  addMapping(key: string, value: string): void;
  deleteMapping(key: string): void;
  clearMappings(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#xml-object
 */
export interface XMLModel extends SpecificationExtensionsModel {
  name: Nullable<string>;
  namespace: Nullable<string>;
  prefix: Nullable<string>;
  attribute: boolean;
  wrapped: boolean;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#response-object
 */
export interface ResponseModel extends SpecificationExtensionsModel {
  description: CommonMarkString;

  readonly headerCount: number;
  headerNames(): IterableIterator<string>;
  headers(): IterableIterator<[string, HeaderModel]>;
  hasHeader(name: string): boolean;
  getHeader(name: string): HeaderModel;
  addHeader(name: string): HeaderModel;
  deleteHeader(name: string): void;
  clearHeaders(): void;

  readonly mediaTypeCount: number;
  mediaTypeKeys(): IterableIterator<MIMETypeString>;
  mediaTypes(): IterableIterator<[MIMETypeString, MediaTypeModel]>;
  hasMediaType(mediaType: MIMETypeString): boolean;
  addMediaType(mediaType: MIMETypeString): MediaTypeModel;
  deleteMediaType(mediaType: MIMETypeString): void;
  clearMediaTypes(): void;

  readonly linkCount: number;
  linkKeys(): IterableIterator<string>;
  links(): IterableIterator<[string, LinkModel]>;
  hasLink(key: string): boolean;
  getLink(key: string): LinkModel;
  addLink(key: string): LinkModel;
  deleteLink(key: string): void;
  clearLinks(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#example-object
 */
export interface ExampleModel extends SpecificationExtensionsModel {
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;
  value: JSONValue;
  externalValue: Nullable<URLString>;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#header-object
 */
export interface HeaderModel extends SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
  required: boolean;
  deprecated: boolean;
  style: HeaderParameterSerializationStyle;
  explode: boolean;

  readonly schema: Nullable<SchemaModel>;
  addSchema(): SchemaModel;
  deleteSchema(): void;

  readonly exampleCount: number;
  exampleKeys(): IterableIterator<string>;
  examples(): IterableIterator<[string, ExampleModel]>;
  hasExample(key: string): boolean;
  addExample(key: string): ExampleModel;
  deleteExample(key: string): void;
  clearExamples(): void;

  readonly mediaTypeCount: number;
  mediaTypeKeys(): IterableIterator<MIMETypeString>;
  mediaTypes(): IterableIterator<[MIMETypeString, MediaTypeModel]>;
  hasMediaType(mediaType: MIMETypeString): boolean;
  addMediaType(mediaType: MIMETypeString): MediaTypeModel;
  deleteMediaType(mediaType: MIMETypeString): void;
  clearMediaTypes(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export interface SecuritySchemaModelBase extends SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export type APIKeySecuritySchemaLocation = 'query' | 'header' | 'cookie';

/**
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export interface APIKeySecuritySchemaModel extends SecuritySchemaModelBase {
  readonly type: 'apiKey';
  name: string;
  in: APIKeySecuritySchemaLocation;
}

/**
 * @see https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml
 */
export type HTTPSecuritySchemaAuthentication =
  | 'Basic'
  | 'Bearer'
  | 'Digest'
  | 'HOBA'
  | 'Mutual'
  | 'Negotiate'
  | 'OAuth'
  | 'SCRAM-SHA-1'
  | 'SCRAM-SHA-256'
  | 'vapid';

/**
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export interface HTTPSecuritySchemaModel extends SecuritySchemaModelBase {
  readonly type: 'http';
  scheme: HTTPSecuritySchemaAuthentication;
  bearerFormat: Nullable<string>;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export interface MutualTLSSecuritySchemaModel extends SecuritySchemaModelBase {
  readonly type: 'mutualTLS';
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export interface OAuth2SecuritySchemaModel extends SecuritySchemaModelBase {
  readonly type: 'oauth2';
  readonly flows: OAuthFlowsModel;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#oauth-flows-object
 */
export interface OAuthFlowsModel extends SpecificationExtensionsModel {
  readonly implicit: Nullable<OAuthImplicitFlowModel>;
  addImplicitFlow(authorizationUrl: URLString, refreshUrl: URLString): OAuthImplicitFlowModel;
  deleteImplicitFlow(): void;

  readonly password: Nullable<OAuthPasswordFlowModel>;
  addPasswordFlow(tokenUrl: URLString, refreshUrl: URLString): OAuthPasswordFlowModel;
  deletePasswordFlow(): void;

  readonly clientCredentials: Nullable<OAuthClientCredentialsFlowModel>;
  addClientCredentialsFlow(
    tokenUrl: URLString,
    refreshUrl: URLString,
  ): OAuthClientCredentialsFlowModel;
  deleteClientCredentialsFlow(): void;

  readonly authorizationCode: Nullable<OAuthAuthorizationCodeFlowModel>;
  addAuthorizationCodeFlow(
    authorizationUrl: URLString,
    tokenUrl: URLString,
    refreshUrl: URLString,
  ): OAuthAuthorizationCodeFlowModel;
  deleteAuthorizationCodeFlow(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#oauth-flow-object
 */
export interface OAuthFlowModelBase extends SpecificationExtensionsModel {
  refreshUrl: URLString;

  readonly scopeCount: number;
  scopeNames(): IterableIterator<string>;
  scopes(): IterableIterator<[string, string]>;
  hasScope(name: string): boolean;
  getScopeDescription(name: string): string;
  addScope(name: string, description: string): void;
  deleteScope(name: string): void;
  clearScopes(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#oauth-flow-object
 */
export interface OAuthImplicitFlowModel extends OAuthFlowModelBase {
  authorizationUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#oauth-flow-object
 */
export interface OAuthPasswordFlowModel extends OAuthFlowModelBase {
  tokenUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#oauth-flow-object
 */
export interface OAuthClientCredentialsFlowModel extends OAuthFlowModelBase {
  tokenUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#oauth-flow-object
 */
export interface OAuthAuthorizationCodeFlowModel extends OAuthFlowModelBase {
  authorizationUrl: URLString;
  tokenUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#oauth-flow-object
 */
export type OAuthFlowModel =
  | OAuthImplicitFlowModel
  | OAuthPasswordFlowModel
  | OAuthClientCredentialsFlowModel
  | OAuthAuthorizationCodeFlowModel;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export interface OpenIDConnectSecuritySchemaModel extends SecuritySchemaModelBase {
  readonly type: 'openIdConnect';
  connectUrl: URLString;
}

/**
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export type SecuritySchemaModel =
  | APIKeySecuritySchemaModel
  | HTTPSecuritySchemaModel
  | MutualTLSSecuritySchemaModel
  | OAuth2SecuritySchemaModel
  | OpenIDConnectSecuritySchemaModel;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export type SecuritySchemaType = SecuritySchemaModel['type'];

/**
 * @see https://spec.openapis.org/oas/v3.1.0#link-object
 */
export interface LinkModel extends SpecificationExtensionsModel {
  operation: Nullable<OperationModel>;

  readonly parameterCount: number;
  parameterNames(): IterableIterator<string>;
  parameters(): IterableIterator<[string, JSONValue]>;
  hasParameter(name: string): boolean;
  getParameterValue(name: string): JSONValue;
  setParameterValue(name: string, value: JSONValue): void;
  deleteParameter(name: string): void;
  clearParameter(): void;

  requestBody: JSONValue;
  description: Nullable<CommonMarkString>;
  server: Nullable<ServerModel>;
}

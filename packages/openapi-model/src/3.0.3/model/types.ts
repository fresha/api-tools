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

export interface TreeNodeModel<TParent> extends Disposable {
  readonly root: OpenAPIModel;
  readonly parent: TParent;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#specification-extensions
 */
export interface SpecificationExtensionsModel {
  readonly extensionCount: number;
  extensionKeys(): IterableIterator<string>;
  extensions(): IterableIterator<[string, JSONValue]>;
  hasExtension(key: string): boolean;
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
  extends TreeNodeModel<DiscriminatorModelParent>,
    SpecificationExtensionsModel {
  propertyName: string;

  readonly mappingCount: number;
  mappingKeys(): IterableIterator<string>;
  mappings(): IterableIterator<[string, string]>;
  hasMapping(key: string): boolean;
  getMapping(key: string): string | undefined;
  getMappingOrThrow(key: string): string;
  setMapping(key: string, value: string): void;
  deleteMapping(key: string): void;
  clearMappings(): void;
}

// Internal type, extracted for convenience.
type SchemaCreateType = null | SchemaType | SchemaFormat;

// Internal type, extracted for convenience.
type SchemaCreateObject = (
  | {
      type: null;
    }
  | {
      type: 'object';
      properties?: Record<string, CreateSchemaPropertyOptions>;
    }
  | {
      type: 'array';
      items?: CreateSchemaOptions;
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
      exclusiveMinimum?: boolean;
      exclusiveMaximum?: boolean;
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
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
};

/**
 * This is the public type which should be accepted by all schema-creation methods.
 */
export type CreateSchemaOptions = SchemaCreateType | SchemaCreateObject;

/**
 * This is the public type which should be accepted by all methods that can either
 * create a new schema or use the schema provided.
 */
export type CreateOrSetSchemaOptions = CreateSchemaOptions | SchemaModel;

/**
 * This is what allowed to be passed to SchemaModel.setProperty. It differs from
 * CreateOrSetSchemaOptions in that its schema creation POJSO-s has extra attribute,
 * 'required'. The attribute indicates whether a given property is required by its
 * parent schema.
 */
export type CreateSchemaPropertyOptions =
  | SchemaCreateType
  | ((SchemaCreateObject | { type: SchemaModel }) & { required?: boolean })
  | SchemaModel;

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
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/schemas/v3.0/schema.yaml
 */
export interface SchemaModel
  extends TreeNodeModel<SchemaModelParent>,
    SpecificationExtensionsModel {
  title: Nullable<string>;
  multipleOf: Nullable<number>;
  maximum: Nullable<number>;
  exclusiveMaximum: boolean;
  minimum: Nullable<number>;
  exclusiveMinimum: boolean;
  maxLength: Nullable<number>;
  minLength: Nullable<number>;
  pattern: Nullable<string>;
  maxItems: Nullable<number>;
  minItems: Nullable<number>;
  uniqueItems: boolean;
  maxProperties: Nullable<number>;
  minProperties: Nullable<number>;

  readonly allowedValueCount: number;
  allowedValues(): IterableIterator<JSONValue>;
  allowedValueAt(index: number): JSONValue;
  hasAllowedValue(value: JSONValue): boolean;
  addAllowedValues(...values: JSONValue[]): void;
  deleteAllowedValueAt(index: number): void;
  deleteAllowedValues(...values: JSONValue[]): void;
  clearAllowedValues(): void;

  type: Nullable<SchemaType>;

  readonly not: Nullable<SchemaModel>;
  setNot(params: CreateOrSetSchemaOptions): SchemaModel;
  deleteNot(): void;

  readonly additionalProperties: Nullable<SchemaModel | boolean>;
  setAdditionalProperties(value: boolean): boolean;
  setAdditionalProperties(params: CreateOrSetSchemaOptions): SchemaModel;
  deleteAdditionalProperties(): void;

  description: Nullable<CommonMarkString>;
  format: Nullable<SchemaFormat>;
  default: Nullable<JSONValue>;
  nullable: boolean;

  readonly discriminator: Nullable<DiscriminatorModel>;
  setDiscriminator(propertyName: string): DiscriminatorModel;
  deleteDiscriminator(): void;

  readOnly: boolean;
  writeOnly: boolean;

  readonly xml: Nullable<XMLModel>;
  setXML(): XMLModel;
  deleteXML(): void;

  readonly externalDocs: Nullable<ExternalDocumentationModel>;
  setExternalDocs(url: URLString): ExternalDocumentationModel;
  deleteExternalDocs(): void;

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

  /**
   * Returns true is this schema represents a tuple, i.e. an array of fixed size those
   * elements may have different types.
   */
  isTuple(): boolean;

  // /**
  //  * Returns type of this schema, deduced from own type and types of allOf subschemas.
  //  */
  // getTypeDeep(): SchemaType;

  readonly propertyCount: number;
  propertyNames(): IterableIterator<string>;
  properties(): IterableIterator<[string, SchemaModel]>;
  hasProperty(name: string): boolean;
  getProperties(): IterableIterator<SchemaPropertyObject>;
  getProperty(name: string): SchemaModel | undefined;
  getPropertyOrThrow(name: string): SchemaModel;
  setProperty(name: string, options: CreateSchemaPropertyOptions): SchemaModel;
  setProperties(props: Record<string, CreateSchemaPropertyOptions>): SchemaModel;
  deleteProperty(name: string): void;
  clearProperties(): void;

  /**
   * Returns true if this schema of any of its allOf subschemas define any properties.
   * Returns false otherwise.
   */
  hasPropertiesDeep(): boolean;

  /**
   * Iterates over properties of this schema. Includes nested properties
   * from allOf clause. Goes 1 level deep.
   */
  getPropertiesDeep(): IterableIterator<SchemaPropertyObject>;

  /**
   * Returns a schema for a property with the given name. This function looks into
   * schema's own properties, and then in own properties of subschemas from the allOf
   * clauses (if any).
   *
   * @param name property name
   * @returns property schema, or undefined if there is no property with given name
   */
  getPropertyDeep(name: string): SchemaModel | undefined;

  /**
   * Same as {@link getPropertyDeep}, but throws an exception if there is not property
   * with given name.
   *
   * @param name property name
   * @returns property schema
   */
  getPropertyDeepOrThrow(name: string): SchemaModel;

  readonly requiredPropertyCount: number;
  requiredPropertyNames(): IterableIterator<string>;
  requiredProperties(): IterableIterator<[string, SchemaModel]>;
  isPropertyRequired(name: string): boolean;
  setPropertyRequired(name: string, value: boolean): void;

  readonly items: Nullable<SchemaModel>;

  /**
   * Initializes subschema for the `items` property of this schema.
   *
   * @param options creation options
   * @return this.items
   */
  setItems(options: CreateOrSetSchemaOptions): SchemaModel;
  deleteItems(): void;

  readonly allOfCount: number;
  allOf(): IterableIterator<SchemaModel>;
  allOfAt(index: number): SchemaModel;
  addAllOf(options: CreateOrSetSchemaOptions): SchemaModel;
  deleteAllOfAt(index: number): void;
  clearAllOf(): void;

  readonly oneOfCount: number;
  oneOf(): IterableIterator<SchemaModel>;
  oneOfAt(index: number): SchemaModel;
  addOneOf(options: CreateOrSetSchemaOptions): SchemaModel;
  deleteOneOfAt(index: number): void;
  clearOneOf(): void;

  readonly anyOfCount: number;
  anyOf(): IterableIterator<SchemaModel>;
  anyOfAt(index: number): SchemaModel;
  addAnyOf(options: CreateOrSetSchemaOptions): SchemaModel;
  deleteAnyOfAt(index: number): void;
  clearAnyOf(): void;

  arrayOf(parent: SchemaModelParent): SchemaModel;
}

export type SchemaCreateArrayObject = {
  itemsOptions: CreateOrSetSchemaOptions;
  minItems?: number;
  maxItems?: number;
};

export type SchemaCreateArrayOptions = SchemaCreateType | SchemaModel | SchemaCreateArrayObject;

/**
 * This class provides convenience methods for creating SchemaObject-s.
 */
export interface SchemaModelFactory {
  create(parent: SchemaModelParent, params: CreateSchemaOptions): SchemaModel;
  createOrGet(parent: SchemaModelParent, params: CreateOrSetSchemaOptions): SchemaModel;
  createArray(parent: SchemaModelParent, options: SchemaCreateArrayOptions): SchemaModel;
  createObject(
    parent: SchemaModelParent,
    props: Record<string, CreateSchemaPropertyOptions>,
  ): SchemaModel;
}

export type ContactModelParent = InfoModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#contact-object
 */
export interface ContactModel
  extends TreeNodeModel<ContactModelParent>,
    SpecificationExtensionsModel {
  name: Nullable<string>;
  url: Nullable<string>;
  email: Nullable<EmailString>;
}

export type LicenseModelParent = InfoModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#license-object
 */
export interface LicenseModel
  extends TreeNodeModel<LicenseModelParent>,
    SpecificationExtensionsModel {
  name: string;
  url: Nullable<URLString>;
}

export type InfoModelParent = OpenAPIModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#info-object
 */
export interface InfoModel extends TreeNodeModel<InfoModelParent>, SpecificationExtensionsModel {
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
  extends TreeNodeModel<ServerVariableModelParent>,
    SpecificationExtensionsModel {
  defaultValue: string;
  description: Nullable<CommonMarkString>;

  readonly allowedValueCount: number;
  allowedValues(): IterableIterator<string>;
  hasAllowedValue(value: string): boolean;
  addAllowedValues(...values: string[]): void;
  deleteAllowedValues(...values: string[]): void;
  clearAllowedValues(): void;
}

export type ServerModelParent = OpenAPIModel | PathItemModel | OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#server-object
 */
export interface ServerModel
  extends TreeNodeModel<ServerModelParent>,
    SpecificationExtensionsModel {
  url: string;
  description: Nullable<CommonMarkString>;

  readonly variableCount: number;
  variableNames(): IterableIterator<string>;
  variables(): IterableIterator<[string, ServerVariableModel]>;
  hasVariable(name: string): boolean;
  getVariable(name: string): ServerVariableModel | undefined;
  getVariableOrThrow(name: string): ServerVariableModel;
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
  extends TreeNodeModel<ExternalDocumentationModelParent>,
    SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
  url: URLString;
}

export type ParameterModelParent = ComponentsModel | PathItemModel | OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export interface ParameterBaseModel
  extends TreeNodeModel<ParameterModelParent>,
    SpecificationExtensionsModel,
    MediaTypeModelMap,
    ExampleModelMap {
  name: string;
  description: Nullable<CommonMarkString>;
  deprecated: boolean;
  explode: boolean;

  readonly schema: Nullable<SchemaModel>;
  setSchema(params: CreateOrSetSchemaOptions): SchemaModel;
  deleteSchema(): void;

  example: Nullable<JSONValue>;

  setMediaTypeModel(mimeType: MIMETypeString, model: MediaTypeModel): void;
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
export interface ExampleModel
  extends TreeNodeModel<ExampleModelParent>,
    SpecificationExtensionsModel {
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;
  value: JSONValue;
  externalValue: Nullable<URLString>;
}

/**
 * Common interface for nodes exposing a collection of ExampleModel-s.
 */
export interface ExampleModelMap {
  readonly exampleCount: number;
  exampleKeys(): IterableIterator<string>;
  examples(): IterableIterator<[string, ExampleModel]>;
  hasExample(name: string): boolean;
  getExample(name: string): ExampleModel | undefined;
  getExampleOrThrow(name: string): ExampleModel;
  setExampleModel(name: string, model: ExampleModel): void;
  setExample(name: string): ExampleModel;
  deleteExample(name: string): void;
  clearExamples(): void;
}

export type HeaderModelParent = ComponentsModel | ResponseModel | EncodingModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#header-object
 */
export interface HeaderModel
  extends TreeNodeModel<HeaderModelParent>,
    SpecificationExtensionsModel,
    MediaTypeModelMap,
    ExampleModelMap {
  description: Nullable<CommonMarkString>;
  required: boolean;
  deprecated: boolean;
  style: HeaderParameterSerializationStyle;
  explode: boolean;

  readonly schema: Nullable<SchemaModel>;
  setSchema(options: CreateOrSetSchemaOptions): SchemaModel;
  deleteSchema(): void;

  example: JSONValue;
}

export type EncodingModelParent = MediaTypeModel;

export type EncodingSerializationStyle = 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';

/**
 * Common interface for nodes exposing a collection of Header models.
 */
export interface HeaderModelMap {
  readonly headerCount: number;
  headerKeys(): IterableIterator<string>;
  headers(): IterableIterator<[string, HeaderModel]>;
  hasHeader(name: string): boolean;
  getHeader(name: string): HeaderModel | undefined;
  getHeaderOrThrow(name: string): HeaderModel;
  setHeader(name: string): HeaderModel;
  deleteHeader(name: string): void;
  clearHeaders(): void;
}

/**
 * @see https://spec.openapis.org/oas/v3.0.3#encoding-object
 */
export interface EncodingModel
  extends TreeNodeModel<EncodingModelParent>,
    SpecificationExtensionsModel,
    HeaderModelMap {
  contentType: Nullable<string>;
  style: Nullable<EncodingSerializationStyle>;
  explode: boolean;
  allowReserved: boolean;
}

export type MediaTypeModelParent = ParameterModel | RequestBodyModel | ResponseModel | HeaderModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#media-type-object
 */
export interface MediaTypeModel
  extends TreeNodeModel<MediaTypeModelParent>,
    SpecificationExtensionsModel,
    ExampleModelMap {
  readonly schema: Nullable<SchemaModel>;
  setSchema(type: CreateOrSetSchemaOptions): SchemaModel;
  deleteSchema(): void;

  example: JSONValue;

  readonly encodingCount: number;
  encodingKeys(): IterableIterator<string>;
  encodings(): IterableIterator<[string, EncodingModel]>;
  hasEncoding(key: string): boolean;
  getEncoding(key: string): EncodingModel | undefined;
  getEncodingOrThrow(key: string): EncodingModel;
  setEncoding(key: string): EncodingModel;
  deleteEncoding(key: string): void;
  clearEncodings(): void;
}

/**
 * Common interface for nodes that expose collection of MediaTypeModel-s.
 */
export interface MediaTypeModelMap {
  readonly mediaTypeCount: number;
  mediaTypeKeys(): IterableIterator<MIMETypeString>;
  mediaTypes(): IterableIterator<[MIMETypeString, MediaTypeModel]>;
  hasMediaType(mimeType: MIMETypeString): boolean;
  getMediaType(mimeType: MIMETypeString): MediaTypeModel | undefined;
  getMediaTypeOrThrow(mimeType: MIMETypeString): MediaTypeModel;
  setMediaType(mimeType: MIMETypeString): MediaTypeModel;
  deleteMediaType(mimeType: MIMETypeString): void;
  clearMediaTypes(): void;
}

export type RequestBodyModelParent = ComponentsModel | OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#request-body-object
 */
export interface RequestBodyModel
  extends TreeNodeModel<RequestBodyModelParent>,
    SpecificationExtensionsModel,
    MediaTypeModelMap {
  description: Nullable<CommonMarkString>;
  required: boolean;
}

export type ResponseModelParent = ComponentsModel | ResponsesModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#response-object
 */
export interface ResponseModel
  extends TreeNodeModel<ResponseModelParent>,
    SpecificationExtensionsModel,
    MediaTypeModelMap,
    HeaderModelMap,
    LinkModelMap {
  description: CommonMarkString;
}

export type HTTPStatusCode = number | string;

export type ResponsesModelParent = OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#responses-object
 */
export interface ResponsesModel
  extends TreeNodeModel<ResponsesModelParent>,
    SpecificationExtensionsModel {
  readonly default: Nullable<ResponseModel>;
  setDefaultResponse(description: CommonMarkString): ResponseModel;
  setDefaultResponseModel(model: ResponseModel): void;
  deleteDefaultResponse(): void;

  readonly responseCount: number;
  responseCodes(): IterableIterator<HTTPStatusCode>;
  responses(): IterableIterator<[HTTPStatusCode, ResponseModel]>;
  hasResponse(code: HTTPStatusCode): boolean;
  getResponse(code: HTTPStatusCode): ResponseModel | undefined;
  getResponseOrThrow(code: HTTPStatusCode): ResponseModel;
  setResponse(code: HTTPStatusCode, description: CommonMarkString): ResponseModel;
  setResponseModel(code: HTTPStatusCode, model: ResponseModel): void;
  deleteResponse(code: HTTPStatusCode): void;
  clearResponses(): void;
}

export type OperationModelParent = PathItemModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#operation-object
 */
export interface OperationModel
  extends TreeNodeModel<OperationModelParent>,
    SpecificationExtensionsModel,
    CallbackModelMap {
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;
  operationId: Nullable<string>;
  deprecated: boolean;

  /**
   * HTTP method this operation is associated with, within its path item.
   */
  readonly httpMethod: PathItemOperationKey;

  readonly tagCount: number;
  tags(): IterableIterator<string>;
  tagAt(index: number): string;
  hasTag(name: string): boolean;
  addTag(name: string): void;
  deleteTag(name: string): void;
  deleteTagAt(index: number): void;
  clearTags(): void;

  readonly externalDocs: Nullable<ExternalDocumentationModel>;
  setExternalDocs(url: URLString): ExternalDocumentationModel;
  deleteExternalDocs(): void;

  readonly parameterCount: number;
  parameters(): IterableIterator<ParameterModel>;
  parameterAt(index: number): ParameterModel;
  hasParameter(name: string, location?: ParameterLocation): boolean;
  getParameter(name: string, source: ParameterLocation): ParameterModel | undefined;
  getParameterOrThrow(name: string, source: ParameterLocation): ParameterModel;
  addParameter(name: string, source: 'path'): PathParameterModel;
  addParameter(name: string, source: 'query'): QueryParameterModel;
  addParameter(name: string, source: 'header'): HeaderParameterModel;
  addParameter(name: string, source: 'cookie'): CookieParameterModel;
  addParameterModel(param: ParameterModel): void;
  deleteParameterAt(index: number): void;
  deleteParameter(name: string): void;
  clearParameters(): void;

  readonly requestBody: Nullable<RequestBodyModel>;
  setRequestBody(): RequestBodyModel;
  setRequestBodyModel(model: RequestBodyModel): void;
  deleteRequestBody(): void;

  readonly responses: ResponsesModel;
  setDefaultResponse(description: CommonMarkString): ResponseModel;
  deleteDefaultResponse(): void;
  getResponse(code: HTTPStatusCode): ResponseModel | undefined;
  getResponseOrThrow(code: HTTPStatusCode): ResponseModel;
  setResponse(code: HTTPStatusCode, description: CommonMarkString): ResponseModel;
  deleteResponse(code: HTTPStatusCode): void;
  clearResponses(): void;

  readonly effectiveSecurityRequirementCount: number;

  /**
   * Return effective security requirements for this operation. It uses own requirements,
   * if defined; otherwise uses global requirements defined in {@link OpenAPIModel}.
   */
  effectiveSecurityRequirements(): IterableIterator<SecurityRequirementModel>;

  /**
   * Returns the number of own security requirements. Returns null if this operation
   * inherits requirements from the global scope.
   */
  readonly securityRequirementCount: number | undefined;

  /**
   * Iterates over own security requirements. If this operation does not use its own
   * requirements, this function returns null.
   */
  securityRequirements(): IterableIterator<SecurityRequirementModel> | undefined;

  /**
   * Returns own security requirement at given index. If this operation does not use
   * its own requirements, this function return undefined.
   */
  securityRequirementAt(index: number): SecurityRequirementModel | undefined;

  /**
   * Adds a new security requirement to the list of own requirements.
   */
  addSecurityRequirement(): SecurityRequirementModel;

  /**
   * Removes own security requirement at specified index.
   */
  deleteSecurityRequirementAt(index: number): void;

  /**
   * Removes all own security requirements. Does NOT set own requirements to null.
   */
  clearSecurityRequirements(): void;

  /**
   * Deletes all security requirements from this operation, and makes this operation
   * inherit requirements from the global scope.
   */
  deleteSecurityRequirements(): void;

  readonly serverCount: number;
  servers(): IterableIterator<ServerModel>;
  serverAt(index: number): ServerModel;
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
export interface PathItemModel
  extends TreeNodeModel<PathItemModelParent>,
    SpecificationExtensionsModel {
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;

  readonly operationCount: number;
  operationMethods(): IterableIterator<PathItemOperationKey>;
  operations(): IterableIterator<[PathItemOperationKey, OperationModel]>;
  hasOperation(method: PathItemOperationKey): boolean;

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

  addOperation(method: PathItemOperationKey): OperationModel;
  deleteOperation(method: PathItemOperationKey): void;
  clearOperations(): void;

  /**
   * URL associated with this path item in item's parent collection.
   */
  readonly pathUrl: ParametrisedURLString;

  readonly serverCount: number;
  servers(): IterableIterator<ServerModel>;
  serverAt(index: number): ServerModel;
  addServer(url: string): ServerModel;
  deleteServer(url: string): void;
  deleteServerAt(index: number): void;
  clearServers(): void;

  readonly parameterCount: number;
  parameters(): IterableIterator<ParameterModel>;
  parameterAt(index: number): ParameterModel;
  deleteParameterAt(index: number): void;
  hasParameter(name: string, location?: ParameterLocation): boolean;
  getParameter(name: string, location?: ParameterLocation): ParameterModel;
  addParameter(name: string, location: 'path'): PathParameterModel;
  addParameter(name: string, location: 'query'): QueryParameterModel;
  addParameter(name: string, location: 'header'): HeaderParameterModel;
  addParameter(name: string, location: 'cookie'): CookieParameterModel;
  addParameterModel(model: ParameterModel): void;
  deleteParameter(name: string, location?: ParameterLocation): void;
  clearParameters(): void;
}

export type PathsModelParent = OpenAPIModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#paths-object
 */
export interface PathsModel extends TreeNodeModel<PathsModelParent>, SpecificationExtensionsModel {
  readonly pathItemCount: number;
  pathItemUrls(): IterableIterator<ParametrisedURLString>;
  pathItems(): IterableIterator<[ParametrisedURLString, PathItemModel]>;
  hasPathItem(url: ParametrisedURLString): boolean;

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

  setPathItem(key: ParametrisedURLString): PathItemModel;

  deletePathItem(url: ParametrisedURLString): void;
  clearPathItems(): void;

  sort(
    sorter: (
      entry1: [ParametrisedURLString, PathItemModel],
      entry2: [ParametrisedURLString, PathItemModel],
    ) => number,
  ): void;
}

export type SecuritySchemaModelParent = ComponentsModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface SecuritySchemaBaseModel
  extends TreeNodeModel<SecuritySchemaModelParent>,
    SpecificationExtensionsModel {
  description: Nullable<CommonMarkString>;
}

export type APIKeySecuritySchemaModelLocation = 'query' | 'header' | 'cookie';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export interface APIKeySecuritySchemaModel extends SecuritySchemaBaseModel {
  readonly type: 'apiKey';
  name: string;
  in: APIKeySecuritySchemaModelLocation;
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
interface OAuthFlowBaseModel
  extends TreeNodeModel<OAuthFlowModelParent>,
    SpecificationExtensionsModel {
  refreshUrl: Nullable<URLString>;

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
  extends TreeNodeModel<OAuthFlowsModelParent>,
    SpecificationExtensionsModel {
  readonly implicit: Nullable<OAuthImplicitFlowModel>;
  setImplicit(authorizationUrl: URLString): OAuthImplicitFlowModel;
  deleteImplicit(): void;

  readonly password: Nullable<OAuthPasswordFlowModel>;
  setPassword(tokenUrl: URLString): OAuthPasswordFlowModel;
  deletePassword(): void;

  readonly clientCredentials: Nullable<OAuthClientCredentialsFlowModel>;
  setClientCredentials(tokenUrl: URLString): OAuthClientCredentialsFlowModel;
  deleteClientCredentials(): void;

  readonly authorizationCode: Nullable<OAuthAuthorizationCodeFlowModel>;
  setAuthorizationCode(
    authorizationUrl: URLString,
    tokenUrl: URLString,
  ): OAuthAuthorizationCodeFlowModel;
  deleteAuthorizationCode(): void;
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
export interface LinkModel extends TreeNodeModel<LinkModelParent>, SpecificationExtensionsModel {
  operationRef: Nullable<string>;
  operationId: Nullable<string>;
  requestBody: JSONValue;
  description: Nullable<CommonMarkString>;
  server: Nullable<ServerModel>;

  readonly parameterCount: number;
  parameterNames(): IterableIterator<string>;
  parameters(): IterableIterator<[string, JSONValue]>;
  hasParameter(key: string): boolean;
  getParameter(key: string): JSONValue | undefined;
  getParameterOrThrow(key: string): JSONValue;
  setParameter(key: string, value: JSONValue): void;
  deleteParameter(key: string): void;
  clearParameters(): void;
}

/**
 * Common interface for all nodes that expose a map of LinkModel-s.
 */
export interface LinkModelMap {
  readonly linkCount: number;
  linkKeys(): IterableIterator<string>;
  links(): IterableIterator<[string, LinkModel]>;
  hasLink(name: string): boolean;
  getLink(name: string): LinkModel | undefined;
  getLinkOrThrow(name: string): LinkModel;
  setLinkModel(name: string, model: LinkModel): void;
  setLink(name: string): LinkModel;
  deleteLink(name: string): void;
  clearLinks(): void;
}

export type CallbackModelParent = ComponentsModel | OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#callback-object
 */
export interface CallbackModel
  extends TreeNodeModel<CallbackModelParent>,
    SpecificationExtensionsModel {
  readonly pathItemCount: number;
  pathItemUrls(): IterableIterator<ParametrisedURLString>;
  pathItems(): IterableIterator<[ParametrisedURLString, PathItemModel]>;
  hasPathItem(key: ParametrisedURLString): boolean;
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

/**
 * Common interface for nodes exposing a collection of Callback models.
 */
export interface CallbackModelMap {
  readonly callbackCount: number;
  callbackKeys(): IterableIterator<string>;
  callbacks(): IterableIterator<[string, CallbackModel]>;
  hasCallback(name: string): boolean;
  getCallback(name: string): CallbackModel | undefined;
  getCallbackOrThrow(name: string): CallbackModel;
  setCallbackModel(name: string, model: CallbackModel): void;
  setCallback(name: string): CallbackModel;
  deleteCallback(name: string): void;
  clearCallbacks(): void;
}

export type ComponentsModelParent = OpenAPIModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#components-object
 */
export interface ComponentsModel
  extends TreeNodeModel<ComponentsModelParent>,
    SpecificationExtensionsModel,
    CallbackModelMap,
    HeaderModelMap,
    LinkModelMap,
    ExampleModelMap {
  isEmpty(): boolean;

  readonly schemaCount: number;
  schemaKeys(): IterableIterator<string>;
  schemas(): IterableIterator<[string, SchemaModel]>;
  hasSchema(name: string): boolean;
  getSchema(name: string): SchemaModel | undefined;
  getSchemaOrThrow(name: string): SchemaModel;
  setSchemaModel(name: string, model: SchemaModel): void;
  setSchema(name: string, options?: CreateSchemaOptions): SchemaModel;
  deleteSchema(name: string): void;
  clearSchemas(): void;
  sortSchemas(
    sorter: (entry1: [string, SchemaModel], entry2: [string, SchemaModel]) => number,
  ): void;

  readonly responseCount: number;
  responseKeys(): IterableIterator<string>;
  responses(): IterableIterator<[string, ResponseModel]>;
  hasResponse(name: string): boolean;
  getResponse(name: string): ResponseModel | undefined;
  getResponseOrThrow(name: string): ResponseModel;
  setResponseModel(name: string, model: ResponseModel): void;
  setResponse(name: string, description: CommonMarkString): ResponseModel;
  deleteResponse(name: string): void;
  clearResponses(): void;

  readonly parameterCount: number;
  parameterKeys(): IterableIterator<string>;
  parameters(): IterableIterator<[string, ParameterModel]>;
  hasParameter(name: string): boolean;
  getParameter(name: string): ParameterModel | undefined;
  getParameterOrThrow(name: string): ParameterModel;
  setParameterModel(name: string, model: ParameterModel): void;
  setParameter(name: string, kind: 'path', paramName: string): PathParameterModel;
  setParameter(name: string, kind: 'query', paramName: string): QueryParameterModel;
  setParameter(name: string, kind: 'header', paramName: string): HeaderParameterModel;
  setParameter(name: string, kind: 'cookie', paramName: string): CookieParameterModel;
  deleteParameter(name: string): void;
  clearParameters(): void;

  readonly requestBodyCount: number;
  requestBodyKeys(): IterableIterator<string>;
  requestBodies(): IterableIterator<[string, RequestBodyModel]>;
  hasRequestBody(name: string): boolean;
  getRequestBody(name: string): RequestBodyModel | undefined;
  getRequestBodyOrThrow(name: string): RequestBodyModel;
  setRequestBodyModel(name: string, model: RequestBodyModel): void;
  setRequestBody(name: string): RequestBodyModel;
  deleteRequestBody(name: string): void;
  clearRequestBodies(): void;

  setHeaderModel(name: string, model: HeaderModel): void;

  readonly securitySchemaCount: number;
  securitySchemaKeys(): IterableIterator<string>;
  securitySchemas(): IterableIterator<[string, SecuritySchemaModel]>;
  hasSecuritySchema(name: string): boolean;
  getSecuritySchema(name: string): SecuritySchemaModel | undefined;
  getSecuritySchemaOrThrow(name: string): SecuritySchemaModel;
  setSecuritySchemaModel(name: string, model: SecuritySchemaModel): void;
  setSecuritySchema(name: string, kind: 'http'): HTTPSecuritySchemaModel;
  setSecuritySchema(name: string, kind: 'apiKey'): APIKeySecuritySchemaModel;
  setSecuritySchema(name: string, kind: 'oauth2'): OAuth2SecuritySchemaModel;
  setSecuritySchema(name: string, kind: 'openIdConnect'): OpenIDConnectSecuritySchemaModel;
  deleteSecuritySchema(name: string): void;
  clearSecuritySchemes(): void;
}

export type SecurityRequirementModelParent = OpenAPIModel | OperationModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-requirement-object
 */
export interface SecurityRequirementModel
  extends TreeNodeModel<SecurityRequirementModelParent>,
    SpecificationExtensionsModel {
  readonly schemaCount: number;
  schemaNames(): IterableIterator<string>;
  hasSchema(schemaName: string): boolean;
  addSchema(schemaName: string, ...scopes: string[]): void;
  deleteSchema(schemaName: string): void;
  clearSchemas(): void;

  scopeCount(schemaName: string): number;
  getScopes(schemaName: string): IterableIterator<string>;
  addScopes(schemaName: string, ...scopes: string[]): void;
  deleteScopes(schemaName: string, ...scopes: string[]): void;
  clearScopes(schemaName: string): void;
}

export type TagModelParent = OpenAPIModel;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#tag-object
 */
export interface TagModel extends TreeNodeModel<TagModelParent>, SpecificationExtensionsModel {
  name: string;
  description: Nullable<CommonMarkString>;

  readonly externalDocs: Nullable<ExternalDocumentationModel>;
  setExternalDocs(url: URLString): ExternalDocumentationModel;
  deleteExternalDocs(): void;
}

export type XMLModelParent = SchemaModel;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#xml-object
 */
export interface XMLModel extends TreeNodeModel<XMLModelParent>, SpecificationExtensionsModel {
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
  readonly components: ComponentsModel;

  readonly serverCount: number;
  servers(): IterableIterator<ServerModel>;
  serverAt(index: number): ServerModel;
  getServer(url: ParametrisedURLString): ServerModel | undefined;
  getServerOrThrow(url: ParametrisedURLString): ServerModel;
  addServer(
    url: ParametrisedURLString,
    variableDefaults?: Record<string, string>,
    description?: CommonMarkString,
  ): ServerModel;
  deleteServerAt(index: number): void;
  clearServers(): void;

  readonly paths: PathsModel;
  getPathItem(url: ParametrisedURLString): PathItemModel | undefined;
  getPathItemOrThrow(url: ParametrisedURLString): PathItemModel;
  setPathItem(url: ParametrisedURLString): PathItemModel;
  deletePathItem(url: ParametrisedURLString): void;
  clearPathItems(): void;

  readonly securityRequirementCount: number;
  securityRequirements(): IterableIterator<SecurityRequirementModel>;
  securityRequirementAt(index: number): SecurityRequirementModel;
  addSecurityRequirement(): SecurityRequirementModel;
  deleteSecurityRequirementAt(index: number): void;
  clearSecurityRequirements(): void;

  readonly tagCount: number;
  tagNames(): IterableIterator<string>;
  tags(): IterableIterator<TagModel>;
  tagAt(index: number): TagModel;
  hasTag(name: string): boolean;
  indexOfTag(name: string): number;
  getTag(name: string): TagModel | undefined;
  getTagOrThrow(name: string): TagModel;
  addTag(name: string): TagModel;
  deleteTag(name: string): void;
  deleteTagAt(index: number): void;
  clearTags(): void;

  readonly externalDocs: Nullable<ExternalDocumentationModel>;
  setExternalDocs(url: URLString): ExternalDocumentationModel;
  deleteExternalDocs(): void;
}

export interface OpenAPIModelFactory {
  create(): OpenAPIModel;
  create(title: string, version: string): OpenAPIModel;
}

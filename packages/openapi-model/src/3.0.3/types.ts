import type {
  CallbackObject as CallbackObjectBase,
  CookieParameterObject as CookieParameterObjectBase,
  DiscriminatorObject,
  EncodingObject as EncodingObjectBase,
  ExampleObject,
  ExternalDocumentationObject,
  HeaderParameterObject as HeaderParameterObjectBase,
  HTTPSecuritySchemeObject as HTTPSecuritySchemeObjectBase,
  InfoObject,
  LinkObject,
  MediaTypeObject as MediaTypeObjectBase,
  OperationObject as OperationObjectBase,
  ParameterObject as ParameterObjectBase,
  PathItemObject as PathItemObjectBase,
  PathParameterObject as PathParameterObjectBase,
  PathsObject as PathsObjectBase,
  QueryParameterObject as QueryParameterObjectBase,
  RequestBodyObject as RequestBodyObjectBase,
  ResponseObject as ResponseObjectBase,
  ResponsesObject as ResponsesObjectBase,
  SecurityRequirementObject,
  SecuritySchemeObject as SecuritySchemeObjectBase,
  ServerObject,
  SpecificationExtensions,
  TagObject,
  XMLObject,
} from '../baseTypes';
import type { CommonMarkString, JSONValue, ObjectOrRef } from '@fresha/api-tools-core';

export type {
  APIKeySecuritySchemeObject,
  ContactObject,
  CookieParameterSerializationStyle,
  DiscriminatorObject,
  ExampleObject,
  ExternalDocumentationObject,
  HeaderParameterSerializationStyle,
  InfoObject,
  LicenseObject,
  LinkObject,
  OAuth2SecuritySchemeObject,
  OpenIdConnectSecuritySchemeObject,
  PathParameterSerializationStyle,
  QueryParameterSerializationStyle,
  SecurityRequirementObject,
  ServerObject,
  ServerVariableObject,
  TagObject,
  XMLObject,
} from '../baseTypes';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#openapi-object
 */
export type OpenAPIObject = {
  openapi: '3.0.3';
  info: InfoObject;
  servers?: ServerObject[];
  paths: PathsObject;
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#paths-object
 */
export type PathsObject = PathsObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#path-item-object
 */
export type PathItemObject = PathItemObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#operation-object
 */
export type OperationObject = OperationObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export type PathParameterObject = PathParameterObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export type QueryParameterObject = QueryParameterObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export type CookieParameterObject = CookieParameterObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export type HeaderParameterObject = HeaderParameterObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export type ParameterObject = ParameterObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#request-body-object
 */
export type RequestBodyObject = RequestBodyObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#media-type-object
 */
export type MediaTypeObject = MediaTypeObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#schema-object
 */
export type SchemaType = 'boolean' | 'object' | 'array' | 'integer' | 'number' | 'string';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#schema-object
 */
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

/**
 * @see https://spec.openapis.org/oas/v3.0.3#schema-object
 */
export type SchemaObject = {
  title?: string;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: JSONValue[];
  type?: SchemaType;
  allOf?: ObjectOrRef<SchemaObject>[];
  oneOf?: ObjectOrRef<SchemaObject>[];
  anyOf?: ObjectOrRef<SchemaObject>[];
  not?: ObjectOrRef<SchemaObject>;
  items?: ObjectOrRef<SchemaObject>;
  properties?: Record<string, ObjectOrRef<SchemaObject>>;
  additionalProperties?: ObjectOrRef<SchemaObject> | boolean;
  description?: CommonMarkString;
  format?: SchemaFormat;
  default?: JSONValue;
  nullable?: boolean;
  discriminator?: DiscriminatorObject;
  readOnly?: boolean;
  writeOnly?: boolean;
  xml?: XMLObject;
  externalDocs?: ExternalDocumentationObject;
  example?: JSONValue;
  deprecated?: boolean;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#encoding-object
 */
export type EncodingObject = EncodingObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#header-object
 */
export type HeaderObject = Omit<HeaderParameterObjectBase<SchemaObject>, 'name' | 'in'>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#responses-object
 */
export type ResponsesObject = ResponsesObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#response-object
 */
export type ResponseObject = ResponseObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#callback-object
 */
export type CallbackObject = CallbackObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#components-object
 */
export type ComponentsObject = {
  schemas?: Record<string, ObjectOrRef<SchemaObject>>;
  responses?: Record<string, ObjectOrRef<ResponseObject>>;
  parameters?: Record<string, ObjectOrRef<ParameterObject>>;
  examples?: Record<string, ObjectOrRef<ExampleObject>>;
  requestBodies?: Record<string, ObjectOrRef<RequestBodyObject>>;
  headers?: Record<string, ObjectOrRef<HeaderObject>>;
  securitySchemes?: Record<string, ObjectOrRef<SecuritySchemeObject>>;
  links?: Record<string, ObjectOrRef<LinkObject>>;
  callbacks?: Record<string, ObjectOrRef<CallbackObject>>;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export type HTTPSecuritySchemeObject = HTTPSecuritySchemeObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 */
export type SecuritySchemeObject = SecuritySchemeObjectBase<SchemaObject>;

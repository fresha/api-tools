import type {
  CallbackObject as CallbackObjectBase,
  EncodingObject as EncodingObjectBase,
  ExternalDocumentationObject,
  HeaderParameterObject as HeaderParameterObjectBase,
  InfoObject,
  MediaTypeObject as MediaTypeObjectBase,
  ObjectOrRef,
  ParameterObject as ParameterObjectBase,
  PathsObject as PathsObjectBase,
  RequestBodyObject as RequestBodyObjectBase,
  ResponseObject as ResponseObjectBase,
  ResponsesObject as ResponsesObjectBase,
  SecurityRequirementObject,
  SecuritySchemeObject as SecuritySchemeObjectBase,
  ServerObject,
  SpecificationExtensions,
  TagObject,
  XMLObject,
  DiscriminatorObject,
  ExampleObject,
  LinkObject,
} from '../baseTypes';
import type { CommonMarkString, URLString } from '@fresha/api-tools-core';

export type { InfoObject, ContactObject, LicenseObject } from '../baseTypes';

/**
 * @see https://spec.openapis.org/oas/v3.1.0#openapi-object
 */
export type OpenAPIObject = {
  openapi: '3.1.0';
  info: InfoObject;
  jsonSchemaDialect?: URLString;
  servers?: ServerObject[];
  paths?: PathsObject;
  webhooks?: Record<string, ObjectOrRef<PathItemObject>>;
  components?: ComponentsObject;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#paths-object
 */
export type PathsObject = PathsObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#path-item-object
 */
export type PathItemObject = {
  summary?: string;
  description?: CommonMarkString;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  options?: OperationObject;
  head?: OperationObject;
  patch?: OperationObject;
  trace?: OperationObject;
  servers?: ServerObject[];
  parameters?: ObjectOrRef<ParameterObject>[];
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#operation-object
 */
export type OperationObject = {
  tags?: string[];
  summary?: string;
  description?: CommonMarkString;
  externalDocumentation?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: ObjectOrRef<ParameterObject>[];
  requestBody?: ObjectOrRef<RequestBodyObject>;
  responses: ResponsesObject;
  callbacks?: Record<string, ObjectOrRef<CallbackObject>>;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
export type ParameterObject = ParameterObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#request-body-object
 */
export type RequestBodyObject = RequestBodyObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#mediaTypeObject
 */
export type MediaTypeObject = MediaTypeObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#schema-object
 */
export type SchemaObject = {
  type: string[];
  discriminator?: DiscriminatorObject;
  xml?: XMLObject;
};

/**
 * @see https://spec.openapis.org/oas/v3.1.0#encoding-object
 */
export type EncodingObject = EncodingObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#header-object
 */
export type HeaderObject = HeaderParameterObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#responses-object
 */
export type ResponsesObject = ResponsesObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#response-object
 */
export type ResponseObject = ResponseObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#callback-object
 */
export type CallbackObject = CallbackObjectBase<SchemaObject>;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#components-object
 */
export type ComponentsObject = {
  schemas?: Record<string, SchemaObject>;
  responses?: Record<string, ObjectOrRef<ResponseObject>>;
  parameters?: Record<string, ObjectOrRef<ParameterObject>>;
  examples?: Record<string, ObjectOrRef<ExampleObject>>;
  requestBodies?: Record<string, ObjectOrRef<RequestBodyObject>>;
  headers?: Record<string, ObjectOrRef<HeaderObject>>;
  securitySchemas?: Record<string, ObjectOrRef<SecuritySchemeObject>>;
  links?: Record<string, ObjectOrRef<LinkObject>>;
  callbacks?: Record<string, ObjectOrRef<CallbackObject>>;
  pathItems?: Record<string, PathItemObject>;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export type SecuritySchemeObject = SecuritySchemeObjectBase<SchemaObject>;

import type {
  CommonMarkString,
  HTTPStatusCode,
  JSONValue,
  ObjectOrRef,
  URLString,
} from '@fresha/api-tools-core';

/**
 * @see https://spec.openapis.org/oas/v3.0.3#specification-extensions
 * @see https://spec.openapis.org/oas/v3.1.0#specification-extensions
 */
export type SpecificationExtensions = Record<`x-${string}`, JSONValue>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#info-object
 * @see https://spec.openapis.org/oas/v3.1.0#info-object
 */
export type InfoObject = {
  title: string;
  description?: CommonMarkString;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
  version: string;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#contact-object
 * @see https://spec.openapis.org/oas/v3.1.0#contact-object
 */
export type ContactObject = {
  name?: string;
  url?: string;
  email?: string;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#license-object
 * @see https://spec.openapis.org/oas/v3.1.0#license-object
 */
export type LicenseObject = {
  name: string;
  url?: string;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#server-object
 * @see https://spec.openapis.org/oas/v3.1.0#server-object
 */
export type ServerObject = {
  url: string;
  description?: CommonMarkString;
  variables?: Record<string, ServerVariableObject>;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#server-variable-object
 * @see https://spec.openapis.org/oas/v3.1.0#server-variable-object
 */
export type ServerVariableObject = {
  enum?: string[];
  default: string;
  description?: CommonMarkString;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#external-documentation-object
 * @see https://spec.openapis.org/oas/v3.1.0#external-documentation-object
 */
export type ExternalDocumentationObject = {
  description?: string;
  url: string;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#tag-object
 * @see https://spec.openapis.org/oas/v3.1.0#tag-object
 */
export type TagObject = {
  name: string;
  description?: CommonMarkString;
  externalDocs?: ExternalDocumentationObject;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-requirement-object
 * @see https://spec.openapis.org/oas/v3.1.0#security-requirement-object
 */
export type SecurityRequirementObject = Record<string, string[]> & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flows-object
 * @see https://spec.openapis.org/oas/v3.1.0#oauth-flows-object
 */
export type OAuthFlowsObject = {
  implicit?: OAuthImplicitFlowObject;
  password?: OAuthPasswordFlowObject;
  clientCredentials?: OAuthClientCredentialsFlowObject;
  authorizationCode?: OAuthAuthorizationCodeFlowObject;
} & SpecificationExtensions;

type _OAuth2FlowObjectCommon = {
  refreshUrl?: URLString;
  scopes: Record<string, string>;
};

export type OAuthImplicitFlowObject = {
  authorizationUrl: string;
} & _OAuth2FlowObjectCommon &
  SpecificationExtensions;

export type OAuthPasswordFlowObject = {
  tokenUrl: string;
} & _OAuth2FlowObjectCommon &
  SpecificationExtensions;

export type OAuthClientCredentialsFlowObject = {
  tokenUrl: string;
} & _OAuth2FlowObjectCommon &
  SpecificationExtensions;

export type OAuthAuthorizationCodeFlowObject = {
  authorizationUrl: string;
  tokenUrl: string;
} & _OAuth2FlowObjectCommon &
  SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#oauth-flow-object
 * @see https://spec.openapis.org/oas/v3.1.0#oauth-flow-object
 */
export type OAuthFlowObject =
  | OAuthImplicitFlowObject
  | OAuthPasswordFlowObject
  | OAuthClientCredentialsFlowObject
  | OAuthAuthorizationCodeFlowObject;

type _SecuritySchemeObjectCommon = {
  description?: CommonMarkString;
};

export type APIKeySecuritySchemeObject = {
  type: 'apiKey';
  name: string;
  in: 'query' | 'header' | 'cookie';
} & _SecuritySchemeObjectCommon &
  SpecificationExtensions;

export type HTTPSecuritySchemeObject<TScheme> = {
  type: 'http';
  scheme: TScheme;
  bearerFormat?: string;
} & _SecuritySchemeObjectCommon &
  SpecificationExtensions;

export type OAuth2SecuritySchemeObject = {
  type: 'oauth2';
  flows: OAuthFlowsObject;
} & _SecuritySchemeObjectCommon &
  SpecificationExtensions;

export type OpenIdConnectSecuritySchemeObject = {
  type: 'openIdConnect';
  openIdConnectUrl: string;
} & _SecuritySchemeObjectCommon &
  SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#security-scheme-object
 * @see https://spec.openapis.org/oas/v3.1.0#security-scheme-object
 */
export type SecuritySchemeObject<TScheme> =
  | APIKeySecuritySchemeObject
  | HTTPSecuritySchemeObject<TScheme>
  | OAuth2SecuritySchemeObject
  | OpenIdConnectSecuritySchemeObject;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#example-object
 * @see https://spec.openapis.org/oas/v3.1.0#example-object
 */
export type ExampleObject = {
  summary?: string;
  description?: CommonMarkString;
  value?: JSONValue;
  externalValue?: URLString;
} & SpecificationExtensions;

type _ParameterObjectCommon<TSchema> = {
  name: string;
  description?: CommonMarkString;
  deprecated?: boolean;
  explode?: boolean;
  schema?: TSchema;
  example?: JSONValue;
  examples?: Record<string, ObjectOrRef<ExampleObject>>;
  content?: Record<string, MediaTypeObject<TSchema>>;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#style-values
 * @see https://spec.openapis.org/oas/v3.1.0#style-values
 */
export type PathParameterSerializationStyle = 'matrix' | 'label' | 'simple';

export type PathParameterObject<TSchema> = _ParameterObjectCommon<TSchema> & {
  in: 'path';
  required: true;
  style?: PathParameterSerializationStyle;
};

/**
 * @see https://spec.openapis.org/oas/v3.0.3#style-values
 * @see https://spec.openapis.org/oas/v3.1.0#style-values
 */
export type QueryParameterSerializationStyle =
  | 'form'
  | 'spaceDelimited'
  | 'pipeDelimited'
  | 'deepObject';

export type QueryParameterObject<TSchema> = _ParameterObjectCommon<TSchema> & {
  in: 'query';
  required?: boolean;
  allowEmptyValue?: boolean;
  style?: QueryParameterSerializationStyle;
  allowReserved?: boolean;
};

/**
 * @see https://spec.openapis.org/oas/v3.0.3#style-values
 * @see https://spec.openapis.org/oas/v3.1.0#style-values
 */
export type HeaderParameterSerializationStyle = 'simple';

export type HeaderParameterObject<TSchema> = _ParameterObjectCommon<TSchema> & {
  in: 'header';
  required?: boolean;
  style?: HeaderParameterSerializationStyle;
};

/**
 * @see https://spec.openapis.org/oas/v3.0.3#style-values
 * @see https://spec.openapis.org/oas/v3.1.0#style-values
 */
export type CookieParameterSerializationStyle = 'form';

export type CookieParameterObject<TSchema> = _ParameterObjectCommon<TSchema> & {
  in: 'cookie';
  required?: boolean;
  style?: CookieParameterSerializationStyle;
};

/**
 * @see https://spec.openapis.org/oas/v3.0.3#parameter-object
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
export type ParameterObject<TSchema> =
  | PathParameterObject<TSchema>
  | QueryParameterObject<TSchema>
  | HeaderParameterObject<TSchema>
  | CookieParameterObject<TSchema>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#media-type-object
 * @see https://spec.openapis.org/oas/v3.1.0#media-type-object
 */
export type MediaTypeObject<TSchema> = {
  schema?: ObjectOrRef<TSchema>;
  example?: JSONValue;
  examples?: Record<string, ObjectOrRef<ExampleObject>>;
  encoding?: Record<string, EncodingObject<TSchema>>;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#header-object
 * @see https://spec.openapis.org/oas/v3.1.0#header-object
 */
export type HeaderObject<TSchema> = Omit<HeaderParameterObject<TSchema>, 'name' | 'in'>;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#encoding-object
 * @see https://spec.openapis.org/oas/v3.1.0#encoding-object
 */
export type EncodingObject<TSchema> = {
  contentType?: string;
  headers?: Record<string, ObjectOrRef<HeaderObject<TSchema>>>;
  style?: QueryParameterSerializationStyle;
  explode?: boolean;
  allowReserved?: boolean;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#request-body-object
 * @see https://spec.openapis.org/oas/v3.1.0#request-body-object
 */
export type RequestBodyObject<TSchema> = {
  description?: CommonMarkString;
  content: Record<string, MediaTypeObject<TSchema>>;
  required?: boolean;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#discriminator-object
 * @see https://spec.openapis.org/oas/v3.1.0#discriminator-object
 */
export type DiscriminatorObject = {
  propertyName: string;
  mapping?: Record<string, string>;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#xml-object
 * @see https://spec.openapis.org/oas/v3.1.0#xml-object
 */
export type XMLObject = {
  name?: string;
  namespace?: URLString;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#responses-object
 * @see https://spec.openapis.org/oas/v3.1.0#responses-object
 */
export type ResponsesObject<TSchema> = {
  default?: ObjectOrRef<ResponseObject<TSchema>>;
  [statusCode: HTTPStatusCode]: ObjectOrRef<ResponseObject<TSchema>>;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#response-object
 * @see https://spec.openapis.org/oas/v3.1.0#response-object
 */
export type ResponseObject<TSchema> = {
  description: CommonMarkString;
  headers?: Record<string, ObjectOrRef<HeaderObject<TSchema>>>;
  content?: Record<string, ObjectOrRef<MediaTypeObject<TSchema>>>;
  links?: Record<string, ObjectOrRef<LinkObject>>;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#link-object
 * @see https://spec.openapis.org/oas/v3.1.0#link-object
 */
export type LinkObject = {
  operationRef?: URLString;
  operationId?: string;
  parameters?: Record<string, JSONValue>;
  requestBody?: JSONValue;
  description?: CommonMarkString;
  server?: ServerObject;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#callback-object
 * @see https://spec.openapis.org/oas/v3.1.0#callback-object
 */
export type CallbackObject<TSchema> = Record<string, PathItemObject<TSchema>> &
  SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#paths-object
 * @see https://spec.openapis.org/oas/v3.1.0#paths-object
 */
export type PathsObject<TSchema> = {
  [pathUrl: string]: ObjectOrRef<PathItemObject<TSchema>>;
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#path-item-object
 * @see https://spec.openapis.org/oas/v3.1.0#path-item-object
 */
export type PathItemObject<TSchema> = {
  summary?: string;
  description?: CommonMarkString;
  get?: OperationObject<TSchema>;
  put?: OperationObject<TSchema>;
  post?: OperationObject<TSchema>;
  delete?: OperationObject<TSchema>;
  options?: OperationObject<TSchema>;
  head?: OperationObject<TSchema>;
  patch?: OperationObject<TSchema>;
  trace?: OperationObject<TSchema>;
  servers?: ServerObject[];
  parameters?: ObjectOrRef<ParameterObject<TSchema>>[];
} & SpecificationExtensions;

/**
 * @see https://spec.openapis.org/oas/v3.0.3#operation-object
 * @see https://spec.openapis.org/oas/v3.1.0#operation-object
 */
export type OperationObject<TSchema> = {
  tags?: string[];
  summary?: string;
  description?: CommonMarkString;
  externalDocs?: ExternalDocumentationObject;
  operationId?: string;
  parameters?: ObjectOrRef<ParameterObject<TSchema>>[];
  requestBody?: ObjectOrRef<RequestBodyObject<TSchema>>;
  responses: ResponsesObject<TSchema>;
  callbacks?: Record<string, ObjectOrRef<CallbackObject<TSchema>>>;
  deprecated?: boolean;
  security?: SecurityRequirementObject[];
  servers?: ServerObject[];
} & SpecificationExtensions;

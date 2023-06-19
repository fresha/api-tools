/**
 * Adds nullability to given type, an opposite of TS standard NonNullable.
 */
export type Nullable<T> = T | null;

/**
 * String containing CommonMark text.
 *
 * @see https://commonmark.org
 */
export type CommonMarkString = string;

/**
 * String representing a URL, or parts of them.
 */
export type URLString = string;

/**
 * URI template string, like /list/{from}/{to}
 */
export type ParametrisedURLString = string;

/**
 * String representing an e-mail address.
 */
export type EmailString = string;

/**
 * String representing a semantic version string.
 */
export type VersionString = string;

/**
 * String representing a date/time in ISO8601 format.
 */
export type DateTimeString = string;

/**
 * String representing MIME types.
 */
export type MIMETypeString = string;

/**
 * Enumerates well-known HTTP request methods.
 */
export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'CONNECT'
  | 'TRACE';

/**
 * Integer, representing HTTP status code.
 */
export type HTTPStatusCode = number;

//
// JSON spec
//

/**
 * Primitive JSON values.
 */
export type JSONPrimitive = null | boolean | number | string;

/**
 * Any JSON value. This is the root type of JSON spec.
 */
export type JSONValue = JSONPrimitive | JSONArray | JSONObject;

/**
 * JSON array.
 */
export type JSONArray = JSONValue[];

/**
 * JSON object.
 */
export type JSONObject = {
  [key: string]: JSONValue;
};

/**
 * Convenience type, representing a record those values are JSONObject-s only.
 */
export type JSONObjectRecord = Record<string, JSONObject>;

/**
 * Convenience type, representing an array of JSONObject objects.
 */
export type JSONObjectArray = JSONObject[];

/**
 * Convenience type, representing a JSON Pointer string.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6901
 */
export type JSONPointerString = string;

/**
 * JSON Schema reference.
 *
 * @see https://json-schema.org/understanding-json-schema/structuring.html#ref
 */
export type JSONRef = {
  $ref: string;
};

/**
 * Use this if you need to declare some type or a reference to it.
 */
export type ObjectOrRef<T> = T | JSONRef;

/**
 * Convenience type, representing an empty JSON object.
 */
export type EmptyObject = Record<string, never>;

//
// JSON:API spec
//

/**
 * Meta information.
 *
 * @see https://jsonapi.org/format/#document-meta
 */
export type JSONAPIMeta = JSONObject;

/**
 * Represents a single link.
 *
 * @see https://jsonapi.org/format/#document-links
 */
export type JSONAPILink = string | { href: string; meta?: JSONAPIMeta };

/**
 * Represents a resource ID. `JSONAPIResourceID` must either be a string or a string literal.
 *
 * @example
 * JSONAPIResourceID // generic resource ID object
 * JSONAPIResourceID<'employees'> // resource ID for specific resource
 *
 * @typeParam TResourceType resource type string. To identify specific resource,
 *  pass a string literal.
 *
 * @example
 * // generic type, able to represent any resource's ID
 * type AnyResourceID = JSONAPIResourceID;
 *
 * // represents a resource with specific type
 * type EmployeeResourceID = JSONAPIResourceID<'employees'>;
 *
 * @see https://jsonapi.org/format/#document-resource-identifier-objects
 */
export interface JSONAPIResourceID<TResourceType extends string = string> {
  type: TResourceType;
  id: string;
  meta?: JSONAPIMeta;
}

/**
 * Common part for all resource linkage objects.
 */
interface JSONAPIResourceRelationshipBase {
  links?: {
    self: JSONAPILink;
    related: JSONAPILink;
    [other: string]: JSONAPILink;
  };
}

/**
 * Represents an optional one-to-one (or, 0-1) resource relationship.
 *
 * @typeParam TResourceType resource type string. To identify specific resource,
 *  pass a string literal.
 *
 * @example
 * // a 0-1 relationship to any resource
 * type AnyRelationship0 = JSONAPIResourceRelationship0;
 *
 * // a 0-1 relationshop to specific resource
 * type CompanyRelationship0 = JSONAPIResourceRelationship0<'companies'>;
 *
 * @see https://jsonapi.org/format/#document-resource-object-relationships
 * @see https://jsonapi.org/format/#document-resource-object-linkage
 * @see {@link JSONAPIResourceID}
 */
export interface JSONAPIResourceRelationship0<TResourceType extends string = string>
  extends JSONAPIResourceRelationshipBase {
  data: JSONAPIResourceID<TResourceType> | null;
}

/**
 * Represents a one-to-one resource relationship.
 *
 * @typeParam TResourceType resource type string. To identify specific resource,
 *  pass a string literal.
 *
 * @example
 * // a 1-1 relationship to any resource
 * type AnyRelationship1 = JSONAPIResourceRelationship1;
 *
 * // a 1-1 relationshop to specific resource
 * type CompanyRelationship1 = JSONAPIResourceRelationship1<'companies'>;
 *
 * @see https://jsonapi.org/format/#document-resource-object-relationships
 * @see https://jsonapi.org/format/#document-resource-object-linkage
 * @see {@link JSONAPIResourceID}
 */
export interface JSONAPIResourceRelationship1<TResourceType extends string = string>
  extends JSONAPIResourceRelationshipBase {
  data: JSONAPIResourceID<TResourceType>;
}

/**
 * Represents a one-to-many resource relationship.
 *
 * @typeParam TResourceType resource type string. To identify specific resource,
 *  pass a string literal.
 *
 * @example
 * // a 1-N relationship to any resource
 * type AnyRelationshipN = JSONAPIResourceRelationshipN;
 *
 * // a 1-N relationshop to specific resource
 * type CompanyRelationshipN = JSONAPIResourceRelationshipN<'companies'>;
 *
 * @see https://jsonapi.org/format/#document-resource-object-relationships
 * @see https://jsonapi.org/format/#document-resource-object-linkage
 * @see {@link JSONAPIResourceID}
 */
export interface JSONAPIResourceRelationshipN<TResourceType extends string = string>
  extends JSONAPIResourceRelationshipBase {
  data: JSONAPIResourceID<TResourceType>[];
}

/**
 * Represents a resource relationship of any type (both single and multiple).
 *
 * @typeParam TResourceType resource type string. To identify specific resource,
 *  pass a string literal.
 *
 * @see https://jsonapi.org/format/#document-resource-object-relationships
 * @see {@link JSONAPIResourceRelationship0}
 * @see {@link JSONAPIResourceRelationship1}
 * @see {@link JSONAPIResourceRelationshipN}
 */
export type JSONAPIResourceRelationship<TResourceType extends string = string> =
  | JSONAPIResourceRelationship0<TResourceType>
  | JSONAPIResourceRelationship1<TResourceType>
  | JSONAPIResourceRelationshipN<TResourceType>;

/**
 * Base definition of a JSON:API resource.
 *
 * @typeParam TResourceType resource type string
 * @typeParam TAttributesType type of resource attributes.
 *  By default, resources do not have any attributes.
 * @typeParam TRelationshipsType type of resource relationships.
 *  By default, relationships are empty.
 *
 * @example
 * // this type represents a "pet" resource, which has 2 attributes
 * // and 3 relationships
 * type PetResource = JSONAPIServerResource<
 *  'pets',
 *  {
 *    nickName: string;
 *    age?: number;
 *  },
 *  {
 *    shelter: JSONAPIResourceRelationship1<'shelters'>;
 *    owner: JSONAPIResourceRelationship0<'people'>;
 *    siblings: JSONAPIResourceRelationshipN<'pets'>;
 *  }
 * >;
 *
 * @see https://jsonapi.org/format/#document-resource-objects
 * @see {@link JSONAPIServerResource}
 * @see {@link JSONAPIClientResource}
 */
interface JSONAPIResourceBase<
  TResourceType extends string,
  TAttributesType extends JSONObject,
  TRelationshipsType extends Record<string, JSONAPIResourceRelationship>,
> {
  type: TResourceType;
  attributes: TAttributesType;
  relationships?: TRelationshipsType;
  links?: {
    self: JSONAPILink;
  };
  meta?: JSONAPIMeta;
}

/**
 * Represents a JSON:API resource originated from the server.
 *
 * @typeParam TResourceType resource type string
 * @typeParam TAttributesType type of resource attributes.
 *  By default, resources do not have any attributes.
 * @typeParam TRelationshipsType type of resource relationships.
 *  By default, relationships are empty.
 *
 * @see https://jsonapi.org/format/#document-resource-objects
 * @see {@link JSONAPIResourceBase}
 * @see {@link JSONAPIResourceID}
 * @see {@link JSONAPIResourceRelationship}
 */
export interface JSONAPIServerResource<
  TResourceType extends string = string,
  TAttributesType extends JSONObject = JSONObject,
  TRelationshipsType extends Record<string, JSONAPIResourceRelationship> = Record<
    string,
    JSONAPIResourceRelationship
  >,
> extends JSONAPIResourceBase<TResourceType, TAttributesType, TRelationshipsType> {
  id: string;
}

/**
 * Resource originated from the client, that does not yet exist on the server.
 *
 * @typeParam TResourceType resource type string
 * @typeParam TAttributesType type of resource attributes.
 *  By default, resources do not have any attributes.
 * @typeParam TRelationshipsType type of resource relationships.
 *  By default, relationships are empty.
 *
 * @see https://jsonapi.org/format/#document-resource-objects
 * @see {@link JSONAPIResourceID}
 * @see {@link JSONAPIResourceRelationship}
 */
export interface JSONAPIClientResource<
  TResourceType extends string = string,
  TAttributesType extends JSONObject = JSONObject,
  TRelationshipsType extends Record<string, JSONAPIResourceRelationship> = Record<
    string,
    JSONAPIResourceRelationship
  >,
> extends JSONAPIResourceBase<TResourceType, TAttributesType, TRelationshipsType> {
  id?: string;
}

/**
 * Represents any JSON:API resource.
 *
 * @see https://jsonapi.org/format/#document-resource-objects
 */
export type JSONAPIResource<
  TResourceType extends string = string,
  TAttributesType extends JSONObject = EmptyObject,
  TRelationshipsType extends Record<string, JSONAPIResourceRelationship> = EmptyObject,
> =
  | JSONAPIClientResource<TResourceType, TAttributesType, TRelationshipsType>
  | JSONAPIServerResource<TResourceType, TAttributesType, TRelationshipsType>;

/**
 * Holds information about JSON:API implementation.
 *
 * @see https://jsonapi.org/format/#document-jsonapi-object
 */
export interface JSONAPIImplementationInfo {
  version?: '1.0';
  meta?: JSONAPIMeta;
}

/**
 * Holds links for the whole document.
 *
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface JSONAPITopLevelLinks {
  self?: JSONAPILink;
  related?: JSONAPILink;
}

/**
 * @see https://jsonapi.org/format/#document-top-level
 */
interface JSONAPIDocumentBase {
  jsonapi?: JSONAPIImplementationInfo;
  links?: JSONAPITopLevelLinks;
  meta?: JSONAPIMeta;
}

export type JSONAPIClientDocumentPrimaryData =
  | JSONAPIClientResource
  | JSONAPIClientResource[]
  | JSONAPIResourceID
  | JSONAPIResourceID[];

/**
 * Client (request) document.
 *
 * @typeParam TPrimaryData determines the type of document's primary data. This
 *  must be either resource ID type or a resource type
 * @typeParam TIncludedData determines the type(-s) of resources included in
 *  the document. This must be a resource or a union of resource types.
 *
 * @example
 * type Company = JSONAPIResource<'companies', ...>;
 * type Department = JSONAPIResource<'departments', ...>;
 * type Person = JSONAPIResource<'people', ...>;
 *
 * // this document has a single company resource as its primary data,
 * // and a list of either department of person resources included
 * type CompanyDocument = JSONAPIDataDocument<Company, Department | Person>;
 *
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface JSONAPIClientDocument<
  TPrimaryData extends JSONAPIClientDocumentPrimaryData = JSONAPIClientResource,
  TIncludedData extends JSONAPIClientResource = JSONAPIClientResource,
> extends JSONAPIDocumentBase {
  data: TPrimaryData;
  included?: TIncludedData[];
}

export type JSONAPIPrimaryDocumentData =
  | JSONAPIServerResource
  | JSONAPIServerResource[]
  | JSONAPIResourceID
  | JSONAPIResourceID[]
  | null;

/**
 * Server (response) document that contains data.
 *
 * @typeParam TPrimaryData determines the type of document's primary data. This
 *  must be either resource ID type or a resource type
 * @typeParam TIncludedData determines the type(-s) of resources included in
 *  the document. This must be a resource or a union of resource types.
 *
 * @example
 * type Company = JSONAPIResource<'companies', ...>;
 * type Department = JSONAPIResource<'departments', ...>;
 * type Person = JSONAPIResource<'people', ...>;
 *
 * // this document has a single company resource as its primary data,
 * // and a list of either department of person resources included
 * type CompanyDocument = JSONAPIDataDocument<Company, Department | Person>;
 *
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface JSONAPIDataDocument<
  TPrimaryData extends JSONAPIPrimaryDocumentData = JSONAPIServerResource,
  TIncludedData extends JSONAPIServerResource = JSONAPIServerResource,
> extends JSONAPIDocumentBase {
  data: TPrimaryData;
  included?: TIncludedData[];
}

/**
 * A single error object.
 *
 * @see https://jsonapi.org/format/#error-objects
 */
export interface JSONAPIError {
  id?: string;
  links?: {
    about: JSONAPILink;
  };
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: JSONPointerString;
    parameter?: string;
  };
  meta?: JSONAPIMeta;
}

/**
 * Server (response) document that contains error objects.
 *
 * @see https://jsonapi.org/format/#document-top-level
 */
export interface JSONAPIErrorDocument extends JSONAPIDocumentBase {
  errors: JSONAPIError[];
}

/**
 * Represents any document.
 *
 * @see https://jsonapi.org/format/#document-top-level
 */
export type JSONAPIDocument<
  TPrimaryData extends JSONAPIPrimaryDocumentData = JSONAPIServerResource,
  TIncludedData extends JSONAPIServerResource = JSONAPIServerResource,
> = JSONAPIDataDocument<TPrimaryData, TIncludedData> | JSONAPIErrorDocument;

//
// General purpose
//

export interface Disposable {
  dispose(): void;
}

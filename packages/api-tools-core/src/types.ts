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
 * Represents a resource ID.
 *
 * @see https://jsonapi.org/format/#document-resource-identifier-objects
 */
export type JSONAPIResourceID = {
  type: string;
  id: string;
  meta?: JSONAPIMeta;
};

/**
 * Represents a resource relationship (both single and multiple).
 *
 * @see https://jsonapi.org/format/#document-resource-object-relationships
 */
export type JSONAPIResourceRelationship = {
  data: JSONAPIResourceID[] | JSONAPIResourceID | null;
  links?: {
    self: JSONAPILink;
    related: JSONAPILink;
    [other: string]: JSONAPILink;
  };
};

/**
 * @see https://jsonapi.org/format/#document-resource-objects
 */
type JSONAPIResourceBase = {
  type: string;
  attributes?: JSONObject;
  relationships?: Record<string, JSONAPIResourceRelationship>;
  links?: {
    self: JSONAPILink;
  };
  meta?: JSONAPIMeta;
};

/**
 * Resource originated from the server.
 *
 * @see https://jsonapi.org/format/#document-resource-objects
 */
export type JSONAPIServerResource = JSONAPIResourceBase & {
  id: string;
};

/**
 * Resource originated from the client, that does not yet exist on the server.
 *
 * @see https://jsonapi.org/format/#document-resource-objects
 */
export type JSONAPIClientResource = JSONAPIResourceBase & {
  id?: string;
};

/**
 * Represents any resource.
 *
 * @see https://jsonapi.org/format/#document-resource-objects
 */
export type JSONAPIResource = JSONAPIClientResource | JSONAPIServerResource;

/**
 * Holds information about JSON:API implementation.
 *
 * @see https://jsonapi.org/format/#document-jsonapi-object
 */
export type JSONAPIImplementationInfo = {
  version?: '1.0';
  meta?: JSONAPIMeta;
};

/**
 * Holds links for the whole document.
 *
 * @see https://jsonapi.org/format/#document-top-level
 */
export type JSONAPITopLevelLinks = {
  self?: JSONAPILink;
  related?: JSONAPILink;
};

/**
 * @see https://jsonapi.org/format/#document-top-level
 */
type JSONAPIDocumentBase = {
  jsonapi?: JSONAPIImplementationInfo;
  links?: JSONAPITopLevelLinks;
  meta?: JSONAPIMeta;
};

/**
 * Document that contains data.
 *
 * @see https://jsonapi.org/format/#document-top-level
 */
export type JSONAPIDataDocument = JSONAPIDocumentBase & {
  data: JSONAPIResource[] | JSONAPIResource | JSONAPIResourceID[] | JSONAPIResourceID | null;
  included?: JSONAPIResource[];
};

/**
 * A single error object.
 *
 * @see https://jsonapi.org/format/#error-objects
 */
export type JSONAPIError = {
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
};

/**
 * Document that contains error objects.
 *
 * @see https://jsonapi.org/format/#document-top-level
 */
export type JSONAPIErrorDocument = JSONAPIDocumentBase & {
  errors: JSONAPIError[];
};

/**
 * Represents any document.
 *
 * @see https://jsonapi.org/format/#document-top-level
 */
export type JSONAPIDocument = JSONAPIDataDocument | JSONAPIErrorDocument;

import assert from 'assert';
import fs from 'fs';

import yaml from 'yaml';

import { Callback, CallbackParent } from './Callback';
import { Components } from './Components';
import { Contact, ContactParent } from './Contact';
import { Discriminator, DiscriminatorParent } from './Discriminator';
import {
  Encoding,
  EncodingParent,
  SerializationStyle as EncodingSerializationStyle,
} from './Encoding';
import { Example, ExampleParent } from './Example';
import { ExternalDocumentation, ExternalDocumentationParent } from './ExternalDocumentation';
import { Header, HeaderParent, SerializationStyle as HeaderSerializationStyle } from './Header';
import { Info, InfoParent } from './Info';
import { License, LicenseParent } from './License';
import { Link, LinkParent } from './Link';
import { MediaType, MediaTypeParent } from './MediaType';
import { OAuthFlow, OAuthFlowParent } from './OAuthFlow';
import { OAuthAuthorisationCodeFlow } from './OAuthFlow/OAuthAuthorisationCodeFlow';
import { OAuthClientCredentialsFlow } from './OAuthFlow/OAuthClientCredentialsFlow';
import { OAuthImplicitFlow } from './OAuthFlow/OAuthImplicitFlow';
import { OAuthPasswordFlow } from './OAuthFlow/OAuthPasswordFlow';
import { OpenAPI } from './OpenAPI';
import { Operation, OperationParent } from './Operation';
import { QueryParameter, Parameter, ParameterParent, PathParameter } from './Parameter';
import {
  CookieParameter,
  SerializationStyle as CookieParameterSerializationStyle,
} from './Parameter/CookieParameter';
import {
  HeaderParameter,
  SerializationStyle as HeaderParameterSerializationStyle,
} from './Parameter/HeaderParameter';
import { defaultExplode } from './Parameter/utils';
import { PathItem, httpMethods, PathItemParent, whitelistedProperties } from './PathItem';
import { RequestBody, RequestBodyParent } from './RequestBody';
import { Response, ResponseParent } from './Response';
import { Schema, SchemaParent } from './Schema';
import { SecurityRequirement, SecurityRequirementParent } from './SecurityRequirement';
import { SecurityScheme, SecuritySchemeParent } from './SecurityScheme';
import { ApiKeyScheme } from './SecurityScheme/ApiKeyScheme';
import { HttpScheme } from './SecurityScheme/HttpScheme';
import { OAuth2Scheme } from './SecurityScheme/OAuth2Scheme';
import { OpenIdConnectScheme } from './SecurityScheme/OpenIdConnectScheme';
import { Server, ServerParent } from './Server';
import { Tag, TagParent } from './Tag';
import { XML, XMLParent } from './XML';

import type {
  ComponentsObject,
  ContactObject,
  DiscriminatorObject,
  EncodingObject,
  ExampleObject,
  InfoObject,
  LicenseObject,
  LinkObject,
  ObjectOrRef,
  OpenAPIObject,
  Ref,
  RequestBodyObject,
  ResponseObject,
  SchemaFormat,
  SchemaObject,
  SchemaType,
  SecurityRequirementObject,
  ServerObject,
  ServerVariableObject,
  XMLObject,
} from '../types';
import type { ExtensionFields } from './BasicNode';
import type { ServerVariable } from './ServerVariable';
import type {
  HTTPMethod,
  QueryParameterSerializationStyle,
  PathParameterSerializationStyle,
} from './types';
import type { Nullable, JSONObject, JSONArray } from '@fresha/api-tools-core';

const isRef = (arg: unknown): arg is Ref => {
  return arg != null && '$ref' in arg;
};

const isEmpty = (obj?: JSONObject): boolean => {
  return !obj || !Object.keys(obj).length;
};

const getStringAttribute = (
  json: JSONObject | undefined,
  name: string,
  required = true,
): Nullable<string> => {
  if (json == null) {
    return null;
  }
  const result = json[name];
  if (typeof result === 'string') {
    return result;
  }
  if (!required && result == null) {
    return null;
  }
  throw new Error(
    `Property ${name} is expected to be a string, but it is ${typeof result} instead`,
  );
};

const getNumericAttribute = (
  json: JSONObject | undefined,
  name: string,
  required = true,
): Nullable<number> => {
  if (json == null) {
    return null;
  }
  const result = json[name];
  if (typeof result === 'number') {
    return result;
  }
  if (!required && result == null) {
    return null;
  }
  throw new Error(
    `Property ${name} is expected to be a number, but it is ${typeof result} instead`,
  );
};

export class OpenAPIReader {
  private readonly schemaPointers: Map<string, unknown>;

  private components?: Components;
  private componentsSchemas?: Record<string, ObjectOrRef<SchemaObject>>;
  private componentsResponses?: Record<string, ObjectOrRef<ResponseObject>>;
  private componentsRequestBodies?: Record<string, ObjectOrRef<RequestBodyObject>>;
  private componentsLinks?: Record<string, ObjectOrRef<LinkObject>>;

  constructor() {
    this.schemaPointers = new Map<string, unknown>();
  }

  parseFromFile(fileName: string): OpenAPI {
    const text = fs.readFileSync(fileName, 'utf-8');
    const data = yaml.parse(text) as OpenAPIObject;
    return this.parse(data);
  }

  parse(json: OpenAPIObject): OpenAPI {
    this.schemaPointers.clear();
    this.components = undefined;
    this.componentsSchemas = undefined;
    this.componentsResponses = undefined;
    this.componentsRequestBodies = undefined;
    this.componentsLinks = undefined;

    const result = new OpenAPI(json.info.title, json.info.version);
    this.schemaPointers.set('#/', result);

    this.parseExtensionFields(result.extensions, json);

    result.info = this.parseInfo(json.info, result);

    if (json.servers) {
      result.servers = json.servers.map(item => this.parseServer(item, result));
    }

    this.parseComponents(result.components, json.components);

    this.parseExtensionFields(result.paths.extensions, json.paths);
    for (const [path, pathItemJson] of Object.entries(json.paths)) {
      if (!path.startsWith('x-')) {
        const pathItem = this.parsePathItem(pathItemJson as JSONObject, result.paths);
        result.paths.set(path, pathItem);
      }
    }

    if ('security' in json) {
      result.security = this.parseSecurityRequirement(result, json.security);
    }

    if (json.tags?.length) {
      for (const tagJson of json.tags) {
        const tag = this.parseTag(tagJson, result);
        result.tags.push(tag);
      }
    }

    if (json.externalDocs) {
      result.externalDocs = this.parseExternalDocumentation(json.externalDocs, result);
    }

    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  private parseExtensionFields(
    extensionFields: ExtensionFields,
    json?: JSONObject,
    reset = false,
  ): void {
    if (reset) {
      extensionFields.clear();
    }
    if (json != null) {
      for (const [key, value] of Object.entries(json)) {
        if (key.startsWith('x-')) {
          extensionFields.set(key.slice(2), value);
        }
      }
    }
  }

  private parseInfo(json: InfoObject, parent: InfoParent): Info {
    assert(json != null);
    assert(typeof json.title === 'string');
    assert(typeof json.version === 'string');
    const result = new Info(parent, json.title, json.version);
    this.schemaPointers.set('#/info', result);
    this.schemaPointers.set('#/info/contact', result.contact);
    this.schemaPointers.set('#/info/license', result.license);
    this.parseExtensionFields(result.extensions, json);
    result.description = getStringAttribute(json, 'description', false);
    result.termsOfService = getStringAttribute(json, 'termsOfService', false);
    this.parseContact(result, json.contact);
    this.parseLicense(result, json.license);
    return result;
  }

  private parseContact(parent: ContactParent, json?: ContactObject): Nullable<Contact> {
    if (isEmpty(json)) {
      return null;
    }
    const result = parent.contact;
    this.parseExtensionFields(result.extensions, json);
    result.name = getStringAttribute(json, 'name', false);
    result.url = getStringAttribute(json, 'url', false);
    result.email = getStringAttribute(json, 'email', false);
    return result;
  }

  private parseLicense(parent: LicenseParent, json?: LicenseObject): Nullable<License> {
    if (json == null) {
      return null;
    }

    const result = parent.license;
    this.parseExtensionFields(result.extensions, json);
    result.name = getStringAttribute(json, 'name') as string;
    result.url = getStringAttribute(json, 'url', false);
    return result;
  }

  private parseServer(json: ServerObject, parent: ServerParent): Server {
    assert(typeof json.url === 'string');
    const result = new Server(parent, json.url);
    this.parseExtensionFields(result.extensions, json);
    result.description = getStringAttribute(json, 'description', false);
    if (json.variables) {
      for (const [key, value] of Object.entries(json.variables)) {
        const variable = result.variables.get(key);
        assert(variable, `Missing server variable named ${key}`);
        this.parseServerVariable(value, variable);
      }
    }
    return result;
  }

  private parseServerVariable(json: ServerVariableObject, variable: ServerVariable): void {
    this.parseExtensionFields(variable.extensions, json);
    variable.default = getStringAttribute(json, 'default') as string;
    if (Array.isArray(json.enum) && json.enum.length) {
      variable.enum = json.enum.slice();
    }
    variable.description = getStringAttribute(json, 'description', false);
  }

  private parseComponents(result: Components, json?: ComponentsObject): Components {
    this.schemaPointers.set('#/components', result);
    this.components = result;

    if (!json) {
      return result;
    }

    this.parseExtensionFields(result.extensions, json);

    if (json.schemas) {
      this.componentsSchemas = json.schemas;

      for (const [key, value] of Object.entries(json.schemas)) {
        if (!result.schemas.has(key)) {
          const schema = this.parseSchema(value, result);
          result.schemas.set(key, schema);
          this.schemaPointers.set(`#/components/schemas/${key}`, schema);
        }
      }
    }
    if (json.responses) {
      this.componentsResponses = json.responses;

      for (const [key, responseJson] of Object.entries(json.responses)) {
        const response = this.parseResponse(responseJson, result);
        result.responses.set(key, response);
        this.schemaPointers.set(`#/components/responses/${key}`, response);
      }
    }
    if (json.parameters) {
      for (const [key, parameterJson] of Object.entries(json.parameters)) {
        const parameter = this.parseParameter(parameterJson as JSONObject, result);
        result.parameters.set(key, parameter as PathParameter);
        this.schemaPointers.set(`#/components/parameters/${key}`, parameter);
      }
    }
    if (json.examples) {
      for (const [key, exampleJson] of Object.entries(json.examples)) {
        const example = this.parseExample(exampleJson as JSONObject, result);
        result.examples.set(key, example);
        this.schemaPointers.set(`#/components/examples/${key}`, example);
      }
    }
    if (json.requestBodies) {
      this.componentsRequestBodies = json.requestBodies;

      for (const [key, requestBodyJson] of Object.entries(json.requestBodies)) {
        const requestBody = this.parseRequestBody(requestBodyJson, result);
        result.requestBodies.set(key, requestBody);
        this.schemaPointers.set(`#/components/requestBodies/${key}`, requestBody);
      }
    }
    if (json.headers) {
      for (const [key, headerJson] of Object.entries(json.headers)) {
        const header = this.parseHeader(headerJson as JSONObject, result);
        result.headers.set(key, header);
        this.schemaPointers.set(`#/components/headers/${key}`, header);
      }
    }
    if (json.securitySchemes) {
      for (const [key, securitySchemeJson] of Object.entries(json.securitySchemes)) {
        const securityScheme = this.parseSecurityScheme(securitySchemeJson as JSONObject, result);
        result.securitySchemes.set(key, securityScheme);
        this.schemaPointers.set(`#/components/securitySchemes/${key}`, securityScheme);
      }
    }
    if (json.links) {
      this.componentsLinks = json.links;

      for (const [key, linkJson] of Object.entries(json.links)) {
        if (!this.components.links.has(key)) {
          const link = this.parseLink(linkJson as JSONObject, result);
          result.links.set(key, link);
          this.schemaPointers.set(`#/components/links/${key}`, link);
        }
      }
    }
    if (json.callbacks) {
      for (const [key, callbackJson] of Object.entries(json.callbacks)) {
        const callback = this.parseCallback(callbackJson as JSONObject, result);
        result.callbacks.set(key, callback);
        this.schemaPointers.set(`#/components/callbacks/${key}`, callback);
      }
    }

    return result;
  }

  private resolveSchemaFromRef(ref: string): Schema {
    let result = this.schemaPointers.get(ref);
    if (result) {
      assert(result instanceof Schema, `Resolved reference ${ref} is not a Schema instance`);
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsSchemas);
    const json = this.componentsSchemas[key];

    result = this.parseSchema(json, this.components);
    this.components.schemas.set(key, result as Schema);
    this.schemaPointers.set(`#/components/schemas/${key}`, result);

    return result as Schema;
  }

  private parseSchema(json: ObjectOrRef<SchemaObject>, parent: SchemaParent): Schema {
    if (isRef(json)) {
      return this.resolveSchemaFromRef(json.$ref);
    }

    const schema = new Schema(parent);
    this.parseExtensionFields(schema.extensions, json);
    schema.title = getStringAttribute(json, 'title', false);
    schema.multipleOf = getNumericAttribute(json, 'multipleOf', false);
    schema.maximum = getNumericAttribute(json, 'maximum', false);
    schema.exclusiveMaximum = json.exclusiveMaximum ?? null;
    schema.minimum = getNumericAttribute(json, 'minimum', false);
    schema.exclusiveMinimum = json.exclusiveMinimum ?? null;
    schema.minLength = getNumericAttribute(json, 'minLength', false);
    schema.maxLength = getNumericAttribute(json, 'maxLength', false);
    schema.pattern = getStringAttribute(json, 'pattern', false);
    schema.minItems = getNumericAttribute(json, 'minItems', false);
    schema.maxItems = getNumericAttribute(json, 'maxItems', false);
    schema.uniqueItems = !!json.uniqueItems;
    schema.minProperties = getNumericAttribute(json, 'minProperties', false);
    schema.maxProperties = getNumericAttribute(json, 'maxProperties', false);
    for (const elem of json.required ?? []) {
      schema.required.add(elem);
    }
    schema.enum = json.enum ?? null;
    schema.type = getStringAttribute(json, 'type', false) as SchemaType;
    if (json.allOf) {
      schema.allOf = json.allOf.map(subSchemaJson => this.parseSchema(subSchemaJson, schema));
    }
    if (json.oneOf) {
      schema.oneOf = json.oneOf.map(subSchemaJson => this.parseSchema(subSchemaJson, schema));
    }
    if (json.anyOf) {
      schema.anyOf = json.anyOf.map(subSchemaJson => this.parseSchema(subSchemaJson, schema));
    }
    if (json.not) {
      schema.not = this.parseSchema(json.not, schema);
    }
    if (json.items) {
      schema.items = this.parseSchema(json.items, schema);
    }
    if (json.properties) {
      for (const [key, value] of Object.entries(json.properties)) {
        schema.properties.set(key, this.parseSchema(value, schema));
      }
    }
    if ('additionalProperties' in json) {
      if (typeof json.additionalProperties === 'boolean') {
        schema.additionalProperties = json.additionalProperties;
      } else if (json.additionalProperties) {
        schema.additionalProperties = this.parseSchema(json.additionalProperties, schema);
      }
    }
    schema.description = getStringAttribute(json, 'description', false);
    schema.format = getStringAttribute(json, 'format', false) as SchemaFormat;
    if ('default' in json) {
      schema.default = json.default ?? null;
    }
    schema.nullable = !!json.nullable;
    if (json.discriminator) {
      schema.discriminator = this.parseDiscriminator(json.discriminator, schema);
    }
    schema.readOnly = !!json.readOnly;
    schema.writeOnly = !!json.writeOnly;
    if (json.xml) {
      schema.xml = this.parseXML(json.xml, schema);
    }
    if (json.externalDocs) {
      schema.externalDocs = this.parseExternalDocumentation(json.externalDocs, schema);
    }
    if ('example' in json) {
      schema.example = json.example ?? null;
    }
    schema.deprecated = !!json.deprecated;

    return schema;
  }

  private resolveResponseFromRef(ref: string): Response {
    let result = this.schemaPointers.get(ref);
    if (result) {
      assert(result instanceof Response, `Resolved reference ${ref} is not a Schema instance`);
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsResponses);
    const json = this.componentsResponses[key];

    result = this.parseSchema(json, this.components);
    this.components.responses.set(key, result as Response);
    this.schemaPointers.set(`#/components/responses/${key}`, result);

    return result as Response;
  }

  private parseResponse(json: JSONObject, parent: ResponseParent): Response {
    if (isRef(json)) {
      return this.resolveResponseFromRef(json.$ref);
    }

    const result = new Response(
      parent,
      (getStringAttribute(json, 'description', false) as string) ?? 'x',
    );
    if (json.headers) {
      for (const [key, headerJson] of Object.entries(json.headers as JSONObject)) {
        const headerName = key.toLowerCase();
        if (result.headers.has(headerName)) {
          throw new Error(`Duplicate response header ${key}`);
        }
        if (headerName !== 'content-type') {
          const header = this.parseHeader(headerJson as JSONObject, result);
          result.headers.set(key.toLowerCase(), header);
        }
      }
    }
    if (json.content) {
      for (const [key, contentJson] of Object.entries(json.content as JSONObject)) {
        const content = this.parseMediaType(contentJson as JSONObject, result);
        result.content.set(key, content);
      }
    }
    if (json.links) {
      for (const [linkId, linkJson] of Object.entries(json.links as JSONObject)) {
        const link = this.parseLink(linkJson as JSONObject, result);
        result.links.set(linkId, link);
      }
    }
    return result;
  }

  private parseHeader(json: JSONObject, parent: HeaderParent): Header {
    if ('schema' in json && 'content' in json) {
      throw new Error(`Either schema or content should be present, but not both`);
    }
    if ('example' in json && 'examples' in json) {
      throw new Error(`Either example or examples should be present, but not both`);
    }

    const result = new Header(parent);
    this.parseExtensionFields(result.extensions, json);
    if (json.description) {
      result.description = json.description as string;
    }
    if (json.required) {
      result.required = json.required as boolean;
    }
    if (json.deprecated) {
      result.deprecated = json.deprecated as boolean;
    }
    if (json.style) {
      result.style = getStringAttribute(json, 'style', false) as HeaderSerializationStyle;
    }
    if (json.explode) {
      result.explode = json.explode as boolean;
    }
    if (json.schema) {
      result.schema = this.parseSchema(json.schema as SchemaObject, result);
    }
    if (json.example) {
      result.example = json.example;
    }
    if (json.examples) {
      for (const [key, value] of Object.entries(json.examples as JSONObject)) {
        const example = this.parseExample(value as JSONObject, result);
        result.examples.set(key, example);
      }
    }
    return result;
  }

  private parseExample(json: ExampleObject, parent: ExampleParent): Example {
    const result = new Example(parent);
    this.parseExtensionFields(result.extensions, json);
    result.summary = getStringAttribute(json, 'summary', false);
    result.description = getStringAttribute(json, 'description', false);
    result.value = json.value ?? null;
    const externalValue = getStringAttribute(json, 'externalValue', false);
    if (result.value != null && externalValue != null) {
      throw new Error(`Either Example.value or Example.externalValue can be supplied at a time`);
    }
    result.externalValue = externalValue;
    return result;
  }

  private parseMediaType(json: JSONObject, parent: MediaTypeParent): MediaType {
    if (json.example && json.examples) {
      throw new Error(`Either example or examples should be set, but not both`);
    }
    const result = new MediaType(parent);
    if (json.schema) {
      result.schema = this.parseSchema(json.schema as SchemaObject, result);
    }
    if (json.example) {
      result.example = json.example;
    }
    if (json.examples) {
      for (const [key, exampleJson] of Object.entries(json.examples as JSONObject)) {
        const example = this.parseExample(exampleJson as JSONObject, result);
        result.examples.set(key, example);
      }
    }
    if (json.encoding) {
      for (const [mimeType, encodingJson] of Object.entries(json.encoding as JSONObject)) {
        const encoding = this.parseEncoding(encodingJson as JSONObject, result);
        result.encoding.set(mimeType, encoding);
      }
    }
    return result;
  }

  private parseEncoding(json: EncodingObject, parent: EncodingParent): Encoding {
    const result = new Encoding(
      parent,
      getStringAttribute(json as JSONObject, 'contentType') as string,
    );
    if (json.headers) {
      for (const [key, headerJson] of Object.entries(json.headers as JSONObject)) {
        const headerName = key.toLowerCase();
        const header = this.parseHeader(headerJson as JSONObject, result);
        result.headers.set(headerName, header);
      }
    }
    if (json.style) {
      result.style = getStringAttribute(
        json as JSONObject,
        'style',
        false,
      ) as EncodingSerializationStyle;
    }
    if (json.explode) {
      result.explode = json.explode as boolean;
    }
    if (json.allowReserved) {
      result.allowReserved = json.allowReserved as boolean;
    }
    return result;
  }

  private resolveLinkFromRef(ref: string): Link {
    let result = this.schemaPointers.get(ref);
    if (result) {
      assert(result instanceof Link, `Resolved reference ${ref} is not a Link instance`);
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsLinks);
    const json = this.componentsLinks[key];

    result = this.parseLink(json, this.components);
    this.components.links.set(key, result as Link);
    this.schemaPointers.set(`#/components/links/${key}`, result);

    return result as Link;
  }

  private parseLink(json: ObjectOrRef<LinkObject>, parent: LinkParent): Link {
    if (isRef(json)) {
      return this.resolveLinkFromRef(json.$ref);
    }

    const result = new Link(parent);
    this.parseExtensionFields(result.extensions, json);
    if ('operationId' in json) {
      result.operationId = json.operationId as string;
    }
    if (!isEmpty(json.parameters as JSONObject)) {
      for (const [paramName, paramValue] of Object.entries(json.parameters as JSONObject)) {
        result.parameters.set(paramName, paramValue);
      }
    }
    return result;
  }

  private parseParameter(json: JSONObject, parent: ParameterParent): Parameter {
    switch (json.in) {
      case 'path':
        return this.parsePathParameter(json, parent);
      case 'query':
        return this.parseQueryParameter(json, parent);
      case 'cookie':
        return this.parseCookieParameter(json, parent);
      case 'header':
        return this.parseHeaderParameter(json, parent);
      default:
        throw new Error(`Unsupported parameter type ${String(json.in)}`);
    }
  }

  private parseParameterCommon(json: JSONObject, parameter: Parameter): void {
    this.parseExtensionFields(parameter.extensions, json);
    parameter.description = getStringAttribute(json, 'description', false);
    if (json.deprecated) {
      parameter.deprecated = json.deprecated as boolean;
    }
    if ('schema' in json && 'content' in json) {
      throw new Error(`Either schema or content should be present, but not both`);
    }
    if ('schema' in json) {
      parameter.schema = this.parseSchema(json.schema as SchemaObject, parameter);
    }
    if ('content' in json) {
      for (const [mimeType, mediaTypeJson] of Object.entries(json.content as JSONObject)) {
        const mediaType = this.parseMediaType(mediaTypeJson as JSONObject, parameter);
        parameter.content.set(mimeType, mediaType);
      }
    }
    if ('example' in json && 'examples' in json) {
      throw new Error(`Either example or examples should be present, but not both`);
    }
    if (json.example) {
      parameter.example = json.example;
    }
    if (json.examples) {
      for (const [key, value] of Object.entries(json.examples as JSONObject)) {
        const example = this.parseExample(value as JSONObject, parameter);
        parameter.examples.set(key, example);
      }
    }
  }

  private parsePathParameter(json: JSONObject, parent: ParameterParent): PathParameter {
    if (json.in !== 'path') {
      throw new Error(`Wrong in parameter for HeaderParameter ${String(json.in)}`);
    }
    const result = new PathParameter(parent, getStringAttribute(json, 'name') as string);
    this.parseParameterCommon(json, result);
    if (json.required != null && !json.required) {
      throw new Error('Path parameters are always required');
    }
    if (json.style) {
      result.style = getStringAttribute(json, 'style', false) as PathParameterSerializationStyle;
    }
    result.explode = ('explode' in json ? json.explode : defaultExplode[result.style]) as boolean;
    return result;
  }

  private parseQueryParameter(json: JSONObject, parent: ParameterParent): QueryParameter {
    if (json.in !== 'query') {
      throw new Error(`Wrong in parameter for HeaderParameter ${String(json.in)}`);
    }
    const result = new QueryParameter(parent, getStringAttribute(json, 'name') as string);
    this.parseParameterCommon(json, result);
    if (json.required) {
      result.required = json.required as boolean;
    }
    if (json.style) {
      result.style = getStringAttribute(json, 'style', false) as QueryParameterSerializationStyle;
    }
    result.explode = ('explode' in json ? json.explode : defaultExplode[result.style]) as boolean;
    if (json.allowEmptyValue) {
      result.allowEmptyValue = json.allowEmptyValue as boolean;
    }
    if (json.allowReserved) {
      result.allowReserved = json.allowReserved as boolean;
    }
    return result;
  }

  private parseHeaderParameter(json: JSONObject, parent: ParameterParent): HeaderParameter {
    if (json.in !== 'header') {
      throw new Error(`Wrong in parameter for HeaderParameter ${String(json.in)}`);
    }
    const result = new HeaderParameter(parent, getStringAttribute(json, 'name') as string);
    this.parseParameterCommon(json, result);
    if (json.required) {
      result.required = json.required as boolean;
    }
    if (json.style) {
      result.style = getStringAttribute(json, 'style', false) as HeaderParameterSerializationStyle;
    }
    result.explode = ('explode' in json ? json.explode : defaultExplode[result.style]) as boolean;
    return result;
  }

  private parseCookieParameter(json: JSONObject, parent: ParameterParent): CookieParameter {
    if (json.in !== 'cookie') {
      throw new Error(`Wrong in parameter for CookieParameter ${String(json.in)}`);
    }
    const result = new CookieParameter(parent, getStringAttribute(json, 'name') as string);
    this.parseParameterCommon(json, result);
    if (json.required) {
      result.required = json.required as boolean;
    }
    if (json.style) {
      result.style = getStringAttribute(json, 'style', false) as CookieParameterSerializationStyle;
    }
    result.explode = ('explode' in json ? json.explode : defaultExplode[result.style]) as boolean;
    return result;
  }

  private resolveRequestBodyFromRef(ref: string): RequestBody {
    let result = this.schemaPointers.get(ref);
    if (result) {
      assert(
        result instanceof RequestBody,
        `Resolved reference ${ref} is not a RequestBody instance`,
      );
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsRequestBodies);
    const json = this.componentsRequestBodies[key];

    result = this.parseRequestBody(json, this.components);
    this.components.requestBodies.set(key, result as RequestBody);
    this.schemaPointers.set(`#/components/requestBodies/${key}`, result);

    return result as RequestBody;
  }

  private parseRequestBody(
    json: ObjectOrRef<RequestBodyObject>,
    parent: RequestBodyParent,
  ): RequestBody {
    if (isRef(json)) {
      return this.resolveRequestBodyFromRef(json.$ref);
    }

    const result = new RequestBody(parent);
    result.description = getStringAttribute(json, 'description', false) as string;
    if (json.content) {
      for (const [mediaTypeName, mediaTypeData] of Object.entries(json.content)) {
        result.content.set(mediaTypeName, this.parseMediaType(mediaTypeData as JSONObject, result));
      }
    }
    result.required = json.required as boolean;
    return result;
  }

  private parseSecurityScheme(json: JSONObject, parent: SecuritySchemeParent): SecurityScheme {
    switch (json.type) {
      case 'apiKey':
        return this.parseApiKeySecurityScheme(json, parent);
      case 'http':
        return this.parseHttpSecurityScheme(json, parent);
      case 'oauth2':
        return this.parseOauth2SecurityScheme(json, parent);
      case 'openIdConnect':
        return this.parseOpenIdConnectScheme(json, parent);
      default:
        throw new Error(`Unsupported security scheme type ${json.type as string}`);
    }
  }

  private parseSecuritySchemeCommon(json: JSONObject, securitySchema: SecurityScheme): void {
    this.parseExtensionFields(securitySchema.extensions, json);
    securitySchema.description = getStringAttribute(json, 'description', false);
  }

  private parseApiKeySecurityScheme(json: JSONObject, parent: SecuritySchemeParent): ApiKeyScheme {
    if (json.type !== 'apiKey') {
      throw new Error(`Incorrent type value ${String(json.type)}`);
    }
    const result = new ApiKeyScheme(
      parent,
      getStringAttribute(json, 'name') as string,
      getStringAttribute(json, 'in') as 'cookie' | 'header' | 'query',
    );
    this.parseSecuritySchemeCommon(json, result);
    return result;
  }

  private parseHttpSecurityScheme(json: JSONObject, parent: SecuritySchemeParent): HttpScheme {
    if (json.type !== 'http') {
      throw new Error(`Incorrent type value ${String(json.type)}`);
    }
    const result = new HttpScheme(parent);
    this.parseSecuritySchemeCommon(json, result);
    result.scheme = this.parseSchema(json.schema as SchemaObject, result);
    result.bearerFormat = getStringAttribute(json, 'bearerFormat', false);
    return result;
  }

  private parseOauth2SecurityScheme(json: JSONObject, parent: SecuritySchemeParent): OAuth2Scheme {
    if (json.type !== 'oauth2') {
      throw new Error(`Incorrent type value ${String(json.type)}`);
    }

    const result = new OAuth2Scheme(parent);
    this.parseSecuritySchemeCommon(json, result);

    const { authorizationCode, clientCredentials, implicit, password } = json.flows as JSONObject;
    if (authorizationCode) {
      result.flows.authorizationCode = this.parseAuthorisationCodeOAuthFlow(
        authorizationCode as JSONObject,
        result.flows,
      );
    }
    if (clientCredentials) {
      result.flows.clientCredentials = this.parseClientCredentialsOAuthFlow(
        clientCredentials as JSONObject,
        result.flows,
      );
    }
    if (implicit) {
      result.flows.implicit = this.parseImplicitOAuthFlow(implicit as JSONObject, result.flows);
    }
    if (password) {
      result.flows.password = this.parsePasswordOAuthFlow(password as JSONObject, result.flows);
    }

    return result;
  }

  private parseOAuthFlowCommon(json: JSONObject, flow: OAuthFlow): void {
    this.parseExtensionFields(flow.extensions, json);
    flow.refreshUrl = getStringAttribute(json, 'refreshUrl', false);
    if (json.scopes) {
      for (const [key, value] of Object.entries(json.scopes as JSONObject)) {
        flow.scopes.set(key, value as string);
      }
    }
  }

  private parseAuthorisationCodeOAuthFlow(
    json: JSONObject,
    parent: OAuthFlowParent,
  ): OAuthAuthorisationCodeFlow {
    const result = new OAuthAuthorisationCodeFlow(
      parent,
      getStringAttribute(json, 'authorizationUrl') as string,
      getStringAttribute(json, 'tokenUrl') as string,
    );
    this.parseOAuthFlowCommon(json, result);
    return result;
  }

  private parseClientCredentialsOAuthFlow(
    json: JSONObject,
    parent: OAuthFlowParent,
  ): OAuthClientCredentialsFlow {
    const result = new OAuthClientCredentialsFlow(
      parent,
      getStringAttribute(json, 'tokenUrl') as string,
    );
    this.parseOAuthFlowCommon(json, result);
    return result;
  }

  private parseImplicitOAuthFlow(json: JSONObject, parent: OAuthFlowParent): OAuthImplicitFlow {
    const result = new OAuthImplicitFlow(
      parent,
      getStringAttribute(json, 'authorizationUrl') as string,
    );
    this.parseOAuthFlowCommon(json, result);
    return result;
  }

  private parsePasswordOAuthFlow(json: JSONObject, parent: OAuthFlowParent): OAuthPasswordFlow {
    const result = new OAuthPasswordFlow(parent, getStringAttribute(json, 'tokenUrl') as string);
    this.parseOAuthFlowCommon(json, result);
    return result;
  }

  private parseOpenIdConnectScheme(
    json: JSONObject,
    parent: SecuritySchemeParent,
  ): OpenIdConnectScheme {
    if (json.type !== 'openIdConnect') {
      throw new Error(`Incorrent type value ${String(json.type)}`);
    }
    const result = new OpenIdConnectScheme(
      parent,
      getStringAttribute(json, 'openIdConnectUrl') as string,
    );
    this.parseSecuritySchemeCommon(json, result);
    return result;
  }

  private parseCallback(json: JSONObject, parent: CallbackParent): Callback {
    const result = new Callback(parent);
    this.parseExtensionFields(result.extensions, json);
    for (const [key, value] of Object.entries(json)) {
      if (!key.startsWith('x-')) {
        const pathItem = this.parsePathItem(value as JSONObject, result);
        result.paths.set(key, pathItem);
      }
    }
    return result;
  }

  private parsePathItem(json: JSONObject, parent: PathItemParent): PathItem {
    const unknownMethods = Object.keys(json).filter(attr => {
      return !attr.startsWith('x-') && !whitelistedProperties.includes(attr as HTTPMethod);
    });
    if (unknownMethods.length) {
      throw new Error(
        `Unsupported HTTP method(-s) ${unknownMethods.join(',')} ${JSON.stringify(json, null, 2)}`,
      );
    }

    const result = new PathItem(parent);
    this.parseExtensionFields(result.extensions, json);
    result.summary = getStringAttribute(json, 'summary', false);
    result.description = getStringAttribute(json, 'description', false);

    for (const method of httpMethods) {
      if (method in json) {
        const operation = this.parseOperation(json[method] as JSONObject, result);
        result.operations2.set(method, operation);
      }
    }
    if ((json.servers as JSONObject[])?.length > 0) {
      result.servers = (json.servers as ServerObject[]).map(itemJson =>
        this.parseServer(itemJson, result),
      );
    }
    if ((json.parameters as JSONObject[])?.length > 0) {
      result.parameters = (json.parameters as JSONObject[]).map(parameterJson =>
        this.parseParameter(parameterJson, result),
      );
    }
    return result;
  }

  private parseOperation(json: JSONObject, parent: OperationParent): Operation {
    if (json.responses && isEmpty(json.responses as JSONObject)) {
      throw new Error(`Operation responses field cannot be empty`);
    }

    const result = new Operation(parent);
    this.parseExtensionFields(result.extensions, json);
    if (Array.isArray(json.tags)) {
      json.tags.forEach(tag => result.tags.push(tag as string));
    }
    if (json.summary) {
      result.summary = json.summary as string;
    }
    result.description = json.description as string;
    if (json.externalDocs) {
      result.externalDocs = this.parseExternalDocumentation(
        json.externalDocs as JSONObject,
        result,
      );
    }
    if (json.operationId) {
      result.operationId = json.operationId as string;
    }
    if ((json.parameters as JSONArray)?.length) {
      for (const parameterJson of json.parameters as JSONArray) {
        const parameter = this.parseParameter(parameterJson as JSONObject, result);
        result.parameters.push(parameter);
      }
    }
    if (json.requestBody) {
      result.requestBody = this.parseRequestBody(
        json.requestBody as ObjectOrRef<RequestBodyObject>,
        result,
      );
    }

    for (const [key, responseJson] of Object.entries(json.responses as JSONObject)) {
      const response = this.parseResponse(responseJson as JSONObject, result.responses);
      if (key === 'default') {
        result.responses.default = response;
      } else {
        result.responses.codes.set(key, response);
      }
    }

    if (json.callbacks) {
      for (const [callbackId, callbackJson] of Object.entries(json.callbacks)) {
        const callback = this.parseCallback(callbackJson as JSONObject, result);
        result.callbacks.set(callbackId, callback);
      }
    }
    if ('security' in json) {
      result.security = this.parseSecurityRequirement(
        result,
        json.security as SecurityRequirementObject[],
      );
    }
    return result;
  }

  private parseExternalDocumentation(
    json: JSONObject,
    parent: ExternalDocumentationParent,
  ): ExternalDocumentation {
    const result = new ExternalDocumentation(parent, getStringAttribute(json, 'url') as string);
    this.parseExtensionFields(result.extensions, json);
    result.description = getStringAttribute(json, 'description', false);
    return result;
  }

  private parseSecurityRequirement(
    parent: SecurityRequirementParent,
    json?: SecurityRequirementObject[],
  ): Nullable<SecurityRequirement[]> {
    if (!json) {
      return null;
    }
    const result: SecurityRequirement[] = [];
    for (const itemJson of json) {
      const item = new SecurityRequirement(parent);
      this.parseExtensionFields(item.extensions, itemJson);
      for (const [schemeName, requiredScopes] of Object.entries(itemJson)) {
        assert(
          !requiredScopes ||
            (Array.isArray(requiredScopes) && requiredScopes.every(s => typeof s === 'string')),
          'SeecurityRequirement scopes must be an array of strings',
        );
        item.scopes.set(schemeName, requiredScopes as string[]);
      }
      result.push(item);
    }
    return result;
  }

  private parseTag(json: JSONObject, parent: TagParent): Tag {
    const result = new Tag(parent, getStringAttribute(json, 'name') as string);
    this.parseExtensionFields(result.extensions, json);
    result.description = getStringAttribute(json, 'description', false);
    if (json.externalDocs) {
      result.externalDocs = this.parseExternalDocumentation(
        json.externalDocs as JSONObject,
        result,
      );
    }
    return result;
  }

  private parseDiscriminator(
    json: DiscriminatorObject,
    parent: DiscriminatorParent,
  ): Discriminator {
    const result = new Discriminator(parent, json.propertyName);
    this.parseExtensionFields(result.extensions, json);
    return result;
  }

  private parseXML(json: XMLObject, parent: XMLParent): XML {
    const result = new XML(parent);
    this.parseExtensionFields(result.extensions, json);
    if (json.name) {
      result.name = json.name;
    }
    if (json.namespace) {
      result.namespace = json.namespace;
    }
    if (json.prefix) {
      result.prefix = json.prefix;
    }
    result.attribute = json.attribute as boolean;
    result.wrapped = json.wrapped as boolean;
    return result;
  }
}

import assert from 'assert';
import fs from 'fs';

import { Nullable, JSONObject, ObjectOrRef, isJSONRef } from '@fresha/api-tools-core';
import yaml from 'yaml';

import { Callback } from './Callback';
import { Discriminator } from './Discriminator';
import { Encoding } from './Encoding';
import { Example } from './Example';
import { ExternalDocumentation } from './ExternalDocumentation';
import { Header } from './Header';
import { Link } from './Link';
import { MediaType } from './MediaType';
import {
  OAuthAuthorisationCodeFlow,
  OAuthClientCredentialsFlow,
  OAuthImplicitFlow,
  OAuthPasswordFlow,
} from './OAuthFlow';
import { OpenAPI } from './OpenAPI';
import { Operation } from './Operation';
import { QueryParameter, PathParameter, HeaderParameter, CookieParameter } from './Parameter';
import { defaultExplode } from './Parameter/utils';
import { PathItem } from './PathItem';
import { RequestBody } from './RequestBody';
import { Response } from './Response';
import { Schema, SchemaFactory } from './Schema';
import {
  APIKeySecurityScheme,
  HTTPSecurityScheme,
  OAuth2SecurityScheme,
  OpenIdConnectSecurityScheme,
} from './SecurityScheme';
import { Tag } from './Tag';
import { XML } from './XML';

import type {
  APIKeySecuritySchemeObject,
  CallbackObject,
  ComponentsObject,
  ContactObject,
  CookieParameterObject,
  CookieParameterSerializationStyle,
  DiscriminatorObject,
  EncodingObject,
  ExampleObject,
  ExternalDocumentationObject,
  HeaderObject,
  HeaderParameterObject,
  HeaderParameterSerializationStyle,
  HTTPSecuritySchemeObject,
  InfoObject,
  LicenseObject,
  LinkObject,
  MediaTypeObject,
  OAuth2SecuritySchemeObject,
  OpenAPIObject,
  OpenIdConnectSecuritySchemeObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  PathParameterObject,
  QueryParameterObject,
  RequestBodyObject,
  ResponseObject,
  SchemaFormat,
  SchemaObject,
  SchemaType,
  SecurityRequirementObject,
  SecuritySchemeObject,
  ServerObject,
  ServerVariableObject,
  TagObject,
  XMLObject,
} from '../types';
import type {
  PathItemOperationKey,
  QueryParameterSerializationStyle,
  PathParameterSerializationStyle,
  ExtensionFields,
  LicenseModelParent,
  ContactModelParent,
  CallbackModelParent,
  EncodingModelParent,
  DiscriminatorModelParent,
  HeaderModelParent,
  ExampleModelParent,
  MediaTypeModelParent,
  LinkModelParent,
  OperationModelParent,
  ExternalDocumentationModelParent,
  PathItemModelParent,
  SchemaModelParent,
  RequestBodyModelParent,
  SecurityRequirementModelParent,
  ServerModelParent,
  TagModelParent,
  XMLModelParent,
  SchemaModel,
  ResponseModel,
  LinkModel,
  RequestBodyModel,
  ResponseModelParent,
  CallbackModel,
  PathItemModel,
  OpenAPIModel,
  InfoModel,
  ServerModel,
  ServerVariableModel,
  ComponentsModel,
  XMLModel,
  DiscriminatorModel,
  TagModel,
  ExternalDocumentationModel,
  OperationModel,
  OpenIDConnectSecuritySchemaModel,
  SecuritySchemaModel,
  HeaderModel,
  ExampleModel,
  MediaTypeModel,
  EncodingModel,
  ParameterModel,
  PathParameterModel,
  QueryParameterModel,
  HeaderParameterModel,
  CookieParameterModel,
  APIKeySecuritySchemaModel,
  HTTPSecuritySchemaModel,
  OAuth2SecuritySchemaModel,
  ParameterModelParent,
  OAuthFlowModelParent,
  SecuritySchemaModelParent,
  EncodingSerializationStyle,
} from './types';

const operationMethods: PathItemOperationKey[] = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
];

const whitelistedPathItemProperties = [
  ...operationMethods,
  '$ref',
  'summary',
  'description',
  'servers',
  'parameters',
];

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

  private components?: ComponentsModel;
  private componentsSchemas?: Record<string, ObjectOrRef<SchemaObject>>;
  private componentsResponses?: Record<string, ObjectOrRef<ResponseObject>>;
  private componentsParameters?: Record<string, ObjectOrRef<ParameterObject>>;
  private componentsExamples?: Record<string, ObjectOrRef<ExampleObject>>;
  private componentsRequestBodies?: Record<string, ObjectOrRef<RequestBodyObject>>;
  private componentsHeaders?: Record<string, ObjectOrRef<HeaderObject>>;
  private componentsSecuritySchemes?: Record<string, ObjectOrRef<SecuritySchemeObject>>;
  private componentsLinks?: Record<string, ObjectOrRef<LinkObject>>;
  private componentsCallbacks?: Record<string, ObjectOrRef<CallbackObject>>;

  constructor() {
    this.schemaPointers = new Map<string, unknown>();
  }

  parseFromFile(fileName: string): OpenAPIModel {
    const text = fs.readFileSync(fileName, 'utf-8');
    const data = yaml.parse(text) as OpenAPIObject;
    return this.parse(data);
  }

  parse(json: OpenAPIObject): OpenAPIModel {
    this.schemaPointers.clear();
    this.components = undefined;
    this.componentsSchemas = undefined;
    this.componentsResponses = undefined;
    this.componentsParameters = undefined;
    this.componentsExamples = undefined;
    this.componentsRequestBodies = undefined;
    this.componentsHeaders = undefined;
    this.componentsSecuritySchemes = undefined;
    this.componentsLinks = undefined;
    this.componentsCallbacks = undefined;

    const result = new OpenAPI(json.info.title, json.info.version);
    this.schemaPointers.set('#/', result);

    this.parseExtensionFields(result.extensions, json);
    this.parseInfo(json.info, result.info);

    if (json.servers?.length) {
      for (const serverObject of json.servers) {
        this.parseServer(serverObject, result);
      }
    }

    this.parseComponents(result.components, json.components);

    this.parseExtensionFields(result.paths.extensions, json.paths);
    for (const [path, pathItemJson] of Object.entries(json.paths)) {
      if (!path.startsWith('x-')) {
        const pathItem = this.parsePathItem(pathItemJson as JSONObject, result.paths);
        result.paths.set(path, pathItem);
      }
    }

    if (json.security?.length) {
      for (const securityObject of json.security) {
        this.parseSecurityRequirement(securityObject, result);
      }
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

  private parseInfo(json: InfoObject, result: InfoModel): InfoModel {
    assert(json != null);
    assert(typeof json.title === 'string');
    assert(typeof json.version === 'string');

    this.schemaPointers.set('#/info', result);
    this.schemaPointers.set('#/info/contact', result.contact);
    this.schemaPointers.set('#/info/license', result.license);

    this.parseExtensionFields(result.extensions, json);
    result.title = json.title;
    result.version = json.version;
    result.description = getStringAttribute(json, 'description', false);
    result.termsOfService = getStringAttribute(json, 'termsOfService', false);
    this.parseContact(result, json.contact);
    this.parseLicense(result, json.license);
    return result;
  }

  private parseContact(parent: ContactModelParent, json?: ContactObject): void {
    if (!isEmpty(json)) {
      const result = parent.contact;
      this.parseExtensionFields(result.extensions, json);
      result.name = getStringAttribute(json, 'name', false);
      result.url = getStringAttribute(json, 'url', false);
      result.email = getStringAttribute(json, 'email', false);
    }
  }

  private parseLicense(parent: LicenseModelParent, json?: LicenseObject): void {
    if (json != null) {
      const result = parent.license;
      this.parseExtensionFields(result.extensions, json);
      result.name = getStringAttribute(json, 'name') as string;
      result.url = getStringAttribute(json, 'url', false);
    }
  }

  private parseServer(json: ServerObject, parent: ServerModelParent): ServerModel {
    assert(typeof json.url === 'string');
    const result = parent.addServer(json.url);
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

  private parseServerVariable(json: ServerVariableObject, variable: ServerVariableModel): void {
    this.parseExtensionFields(variable.extensions, json);
    variable.default = getStringAttribute(json, 'default') as string;
    if (json.enum?.length) {
      variable.addEnum(...json.enum);
    }
    variable.description = getStringAttribute(json, 'description', false);
  }

  private parseComponents(result: ComponentsModel, json?: ComponentsObject): ComponentsModel {
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
          const schema = result.setSchema(key);
          this.parseSchemaAttributes(value, schema);
          this.schemaPointers.set(`#/components/schemas/${key}`, schema);
        }
      }
    }
    if (json.responses) {
      this.componentsResponses = json.responses;

      for (const [key, responseJson] of Object.entries(json.responses)) {
        const response = this.parseResponse(responseJson, result);
        result.setResponseModel(key, response);
        this.schemaPointers.set(`#/components/responses/${key}`, response);
      }
    }
    if (json.parameters) {
      this.componentsParameters = json.parameters;

      for (const [key, parameterJson] of Object.entries(json.parameters)) {
        const parameter = this.parseParameter(parameterJson, result);
        result.setParameterModel(key, parameter);
        this.schemaPointers.set(`#/components/parameters/${key}`, parameter);
      }
    }
    if (json.examples) {
      this.componentsExamples = json.examples;

      for (const [key, exampleJson] of Object.entries(json.examples)) {
        const example = this.parseExample(exampleJson, result);
        result.setExampleModel(key, example);
        this.schemaPointers.set(`#/components/examples/${key}`, example);
      }
    }
    if (json.requestBodies) {
      this.componentsRequestBodies = json.requestBodies;

      for (const [key, requestBodyJson] of Object.entries(json.requestBodies)) {
        const requestBody = this.parseRequestBody(requestBodyJson, result);
        result.setRequestBodyModel(key, requestBody);
        this.schemaPointers.set(`#/components/requestBodies/${key}`, requestBody);
      }
    }
    if (json.headers) {
      this.componentsHeaders = json.headers;

      for (const [key, headerJson] of Object.entries(json.headers)) {
        const header = this.parseHeader(headerJson, result);
        result.setHeaderModel(key, header);
        this.schemaPointers.set(`#/components/headers/${key}`, header);
      }
    }
    if (json.securitySchemes) {
      this.componentsSecuritySchemes = json.securitySchemes;

      for (const [key, securitySchemeJson] of Object.entries(json.securitySchemes)) {
        const securityScheme = this.parseSecurityScheme(securitySchemeJson, result);
        result.setSecuritySchemaModel(key, securityScheme);
        this.schemaPointers.set(`#/components/securitySchemes/${key}`, securityScheme);
      }
    }
    if (json.links) {
      this.componentsLinks = json.links;

      for (const [key, linkJson] of Object.entries(json.links)) {
        if (!this.components.links.has(key)) {
          const link = this.parseLink(linkJson, result);
          result.setLinkModel(key, link);
          this.schemaPointers.set(`#/components/links/${key}`, link);
        }
      }
    }
    if (json.callbacks) {
      this.componentsCallbacks = json.callbacks;

      for (const [key, callbackJson] of Object.entries(json.callbacks)) {
        const callback = this.parseCallback(callbackJson, result);
        result.setCallbackModel(key, callback);
        this.schemaPointers.set(`#/components/callbacks/${key}`, callback);
      }
    }

    return result;
  }

  private resolveSchemaFromRef(ref: string): SchemaModel {
    let result = this.schemaPointers.get(ref) as SchemaModel | undefined;
    if (result) {
      assert(result instanceof Schema, `Resolved reference ${ref} is not a Schema instance`);
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsSchemas);
    const json = this.componentsSchemas[key];

    result = this.components.setSchema(key);
    this.parseSchemaAttributes(json, result);
    this.schemaPointers.set(`#/components/schemas/${key}`, result);

    return result;
  }

  private parseSchemaAttributes(json: SchemaObject, model: SchemaModel): void {
    this.parseExtensionFields(model.extensions, json);
    model.title = getStringAttribute(json, 'title', false);
    model.multipleOf = getNumericAttribute(json, 'multipleOf', false);
    model.maximum = getNumericAttribute(json, 'maximum', false);
    model.exclusiveMaximum = json.exclusiveMaximum ?? null;
    model.minimum = getNumericAttribute(json, 'minimum', false);
    model.exclusiveMinimum = json.exclusiveMinimum ?? null;
    model.minLength = getNumericAttribute(json, 'minLength', false);
    model.maxLength = getNumericAttribute(json, 'maxLength', false);
    model.pattern = getStringAttribute(json, 'pattern', false);
    model.minItems = getNumericAttribute(json, 'minItems', false);
    model.maxItems = getNumericAttribute(json, 'maxItems', false);
    model.uniqueItems = !!json.uniqueItems;
    model.minProperties = getNumericAttribute(json, 'minProperties', false);
    model.maxProperties = getNumericAttribute(json, 'maxProperties', false);
    model.enum = json.enum ?? null;
    model.type = getStringAttribute(json, 'type', false) as SchemaType;
    if (json.allOf) {
      model.allOf = json.allOf.map(subSchemaJson => this.parseSchema(subSchemaJson, model));
    }
    if (json.oneOf) {
      model.oneOf = json.oneOf.map(subSchemaJson => this.parseSchema(subSchemaJson, model));
    }
    if (json.anyOf) {
      model.anyOf = json.anyOf.map(subSchemaJson => this.parseSchema(subSchemaJson, model));
    }
    if (json.not) {
      model.not = this.parseSchema(json.not, model);
    }
    if (json.items) {
      model.items = this.parseSchema(json.items, model);
    }
    if (json.properties) {
      for (const [key, value] of Object.entries(json.properties)) {
        model.setProperty(key, { type: this.parseSchema(value, model), required: false });
      }
    }
    for (const elem of json.required ?? []) {
      model.setPropertyRequired(elem, true);
    }
    if ('additionalProperties' in json) {
      if (typeof json.additionalProperties === 'boolean') {
        model.additionalProperties = json.additionalProperties;
      } else if (json.additionalProperties) {
        model.additionalProperties = this.parseSchema(json.additionalProperties, model);
      }
    }
    model.description = getStringAttribute(json, 'description', false);
    model.format = getStringAttribute(json, 'format', false) as SchemaFormat;
    if ('default' in json) {
      model.default = json.default ?? null;
    }
    model.nullable = !!json.nullable;
    if (json.discriminator) {
      model.discriminator = this.parseDiscriminator(json.discriminator, model);
    }
    model.readOnly = !!json.readOnly;
    model.writeOnly = !!json.writeOnly;
    if (json.xml) {
      model.xml = this.parseXML(json.xml, model);
    }
    if (json.externalDocs) {
      model.externalDocs = this.parseExternalDocumentation(json.externalDocs, model);
    }
    if ('example' in json) {
      model.example = json.example ?? null;
    }
    model.deprecated = !!json.deprecated;
  }

  private parseSchema(json: ObjectOrRef<SchemaObject>, parent: SchemaModelParent): SchemaModel {
    if (isJSONRef(json)) {
      return this.resolveSchemaFromRef(json.$ref);
    }
    const schema = SchemaFactory.create(parent, null);
    this.parseSchemaAttributes(json, schema);
    return schema;
  }

  private resolveResponseFromRef(ref: string): ResponseModel {
    let result = this.schemaPointers.get(ref) as ResponseModel | undefined;
    if (result) {
      assert(result instanceof Response, `Resolved reference ${ref} is not a Schema instance`);
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsResponses);
    const json = this.componentsResponses[key];

    result = this.parseResponse(json, this.components);
    this.components.setResponseModel(key, result);
    this.schemaPointers.set(`#/components/responses/${key}`, result);

    return result;
  }

  private parseResponse(
    json: ObjectOrRef<ResponseObject>,
    parent: ResponseModelParent,
  ): ResponseModel {
    if (isJSONRef(json)) {
      return this.resolveResponseFromRef(json.$ref);
    }

    const result = new Response(
      parent,
      (getStringAttribute(json, 'description', false) as string) ?? 'x',
    );
    if (json.headers) {
      for (const [key, headerJson] of Object.entries(json.headers)) {
        const headerName = key.toLowerCase();
        if (result.headers.has(headerName)) {
          throw new Error(`Duplicate response header ${key}`);
        }
        if (headerName !== 'content-type') {
          const header = this.parseHeader(headerJson, result);
          result.headers.set(key.toLowerCase(), header);
        }
      }
    }
    if (json.content) {
      for (const [key, contentJson] of Object.entries(json.content)) {
        const content = this.parseMediaType(contentJson, result);
        result.content.set(key, content);
      }
    }
    if (json.links) {
      for (const [linkId, linkJson] of Object.entries(json.links)) {
        const link = this.parseLink(linkJson, result);
        result.links.set(linkId, link);
      }
    }
    return result;
  }

  private resolveHeaderFromRef(ref: string): HeaderModel {
    let result = this.schemaPointers.get(ref) as HeaderModel | undefined;
    if (result) {
      assert(result instanceof Header, `Resolved reference ${ref} is not a Header instance`);
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsHeaders);
    const json = this.componentsHeaders[key];

    result = this.parseHeader(json, this.components);
    this.components.setHeaderModel(key, result);
    this.schemaPointers.set(`#/components/headers/${key}`, result);

    return result;
  }

  private parseHeader(json: ObjectOrRef<HeaderObject>, parent: HeaderModelParent): HeaderModel {
    if (isJSONRef(json)) {
      return this.resolveHeaderFromRef(json.$ref);
    }

    if ('schema' in json && 'content' in json) {
      throw new Error(`Either schema or content should be present, but not both`);
    }
    if ('example' in json && 'examples' in json) {
      throw new Error(`Either example or examples should be present, but not both`);
    }

    const result = new Header(parent);
    this.parseExtensionFields(result.extensions, json);
    if (json.description) {
      result.description = json.description;
    }
    if (json.required) {
      result.required = json.required as boolean;
    }
    if (json.deprecated) {
      result.deprecated = json.deprecated as boolean;
    }
    if (json.style) {
      result.style = getStringAttribute(json, 'style', false) as HeaderParameterSerializationStyle;
    }
    if (json.explode) {
      result.explode = json.explode as boolean;
    }
    if (json.schema) {
      result.schema = this.parseSchema(json.schema, result);
    }
    if (json.example) {
      result.example = json.example;
    }
    if (json.examples) {
      for (const [key, value] of Object.entries(json.examples)) {
        const example = this.parseExample(value, result);
        result.examples.set(key, example);
      }
    }
    return result;
  }

  private resolveExampleFromRef(ref: string): ExampleModel {
    let result = this.schemaPointers.get(ref) as ExampleModel | undefined;
    if (result) {
      assert(result instanceof Example, `Resolved reference ${ref} is not a Example instance`);
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsExamples);
    const json = this.componentsExamples[key];

    result = this.parseExample(json, this.components);
    this.components.setExampleModel(key, result);
    this.schemaPointers.set(`#/components/examples/${key}`, result);

    return result;
  }

  private parseExample(json: ObjectOrRef<ExampleObject>, parent: ExampleModelParent): ExampleModel {
    if (isJSONRef(json)) {
      return this.resolveExampleFromRef(json.$ref);
    }

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

  private parseMediaType(json: MediaTypeObject, parent: MediaTypeModelParent): MediaTypeModel {
    if (json.example && json.examples) {
      throw new Error(`Either example or examples should be set, but not both`);
    }
    const result = new MediaType(parent);
    if (json.schema) {
      result.schema = this.parseSchema(json.schema, result);
    }
    if (json.example) {
      result.example = json.example;
    }
    if (json.examples) {
      for (const [key, exampleJson] of Object.entries(json.examples)) {
        const example = this.parseExample(exampleJson, result);
        result.examples.set(key, example);
      }
    }
    if (json.encoding) {
      for (const [mimeType, encodingJson] of Object.entries(json.encoding)) {
        const encoding = this.parseEncoding(encodingJson, result);
        result.encoding.set(mimeType, encoding);
      }
    }
    return result;
  }

  private parseEncoding(json: EncodingObject, parent: EncodingModelParent): EncodingModel {
    const result = new Encoding(parent, getStringAttribute(json, 'contentType') as string);
    if (json.headers) {
      for (const [key, headerJson] of Object.entries(json.headers)) {
        const headerName = key.toLowerCase();
        const header = this.parseHeader(headerJson, result);
        result.headers.set(headerName, header);
      }
    }
    if (json.style) {
      result.style = getStringAttribute(json, 'style', false) as EncodingSerializationStyle;
    }
    if (json.explode) {
      result.explode = json.explode as boolean;
    }
    if (json.allowReserved) {
      result.allowReserved = json.allowReserved as boolean;
    }
    return result;
  }

  private resolveLinkFromRef(ref: string): LinkModel {
    let result = this.schemaPointers.get(ref) as LinkModel | undefined;
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
    this.components.setLinkModel(key, result);
    this.schemaPointers.set(`#/components/links/${key}`, result);

    return result;
  }

  private parseLink(json: ObjectOrRef<LinkObject>, parent: LinkModelParent): LinkModel {
    if (isJSONRef(json)) {
      return this.resolveLinkFromRef(json.$ref);
    }

    const result = new Link(parent);
    this.parseExtensionFields(result.extensions, json);
    if ('operationId' in json) {
      result.operationId = json.operationId as string;
    }
    if (!isEmpty(json.parameters)) {
      for (const [paramName, paramValue] of Object.entries(json.parameters as JSONObject)) {
        result.parameters.set(paramName, paramValue);
      }
    }
    return result;
  }

  private resolveParameterFromRef(ref: string): ParameterModel {
    let result = this.schemaPointers.get(ref) as ParameterModel | undefined;
    if (result) {
      assert(
        [PathParameter, QueryParameter, HeaderParameter, CookieParameter].some(
          klass => result instanceof klass,
        ),
        `Resolved reference ${ref} is not a Parameter instance`,
      );
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsParameters);
    const json = this.componentsParameters[key];

    result = this.parseParameter(json, this.components);
    this.components.setParameterModel(key, result);
    this.schemaPointers.set(`#/components/parameters/${key}`, result);

    return result;
  }

  // eslint-disable-next-line consistent-return
  private parseParameter(
    json: ObjectOrRef<ParameterObject>,
    parent: ParameterModelParent,
  ): ParameterModel {
    if (isJSONRef(json)) {
      return this.resolveParameterFromRef(json.$ref);
    }

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
        assert.fail(`Unsupported parameter type ${String(json)}`);
    }
  }

  private parseParameterCommon(json: ParameterObject, parameter: ParameterModel): void {
    this.parseExtensionFields(parameter.extensions, json);
    parameter.description = getStringAttribute(json, 'description', false);
    if (json.deprecated) {
      parameter.deprecated = json.deprecated as boolean;
    }
    if ('schema' in json && 'content' in json) {
      throw new Error(`Either schema or content should be present, but not both`);
    }
    if (json.schema) {
      parameter.schema = this.parseSchema(json.schema, parameter);
    }
    if ('content' in json) {
      for (const [mimeType, mediaTypeJson] of Object.entries(json.content as JSONObject)) {
        const mediaType = this.parseMediaType(mediaTypeJson as JSONObject, parameter);
        parameter.setContentModel(mimeType, mediaType);
      }
    }
    if ('example' in json && 'examples' in json) {
      throw new Error(`Either example or examples should be present, but not both`);
    }
    if (json.example) {
      parameter.example = json.example;
    }
    if (json.examples) {
      for (const [key, value] of Object.entries(json.examples)) {
        const example = this.parseExample(value, parameter);
        parameter.setExampleModel(key, example);
      }
    }
  }

  private parsePathParameter(
    json: PathParameterObject,
    parent: ParameterModelParent,
  ): PathParameterModel {
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

  private parseQueryParameter(
    json: QueryParameterObject,
    parent: ParameterModelParent,
  ): QueryParameterModel {
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

  private parseHeaderParameter(
    json: HeaderParameterObject,
    parent: ParameterModelParent,
  ): HeaderParameterModel {
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

  private parseCookieParameter(
    json: CookieParameterObject,
    parent: ParameterModelParent,
  ): CookieParameterModel {
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

  private resolveRequestBodyFromRef(ref: string): RequestBodyModel {
    let result = this.schemaPointers.get(ref) as RequestBodyModel | undefined;
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
    this.components.setRequestBodyModel(key, result);
    this.schemaPointers.set(`#/components/requestBodies/${key}`, result);

    return result;
  }

  private parseRequestBody(
    json: ObjectOrRef<RequestBodyObject>,
    parent: RequestBodyModelParent,
  ): RequestBodyModel {
    if (isJSONRef(json)) {
      return this.resolveRequestBodyFromRef(json.$ref);
    }

    const result = new RequestBody(parent);
    result.description = getStringAttribute(json, 'description', false) as string;
    if (json.content) {
      for (const [mediaTypeName, mediaTypeData] of Object.entries(json.content)) {
        result.content.set(mediaTypeName, this.parseMediaType(mediaTypeData, result));
      }
    }
    result.required = json.required as boolean;
    return result;
  }

  private resolveSecuritySchemeFromRef(ref: string): SecuritySchemaModel {
    let result = this.schemaPointers.get(ref) as SecuritySchemaModel | undefined;
    if (result) {
      assert(
        [
          APIKeySecurityScheme,
          HTTPSecurityScheme,
          OAuth2SecurityScheme,
          OpenIdConnectSecurityScheme,
        ].some(klass => result instanceof klass),
        `Resolved reference ${ref} is not a SecuritySchema instance`,
      );
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsSecuritySchemes);
    const json = this.componentsSecuritySchemes[key];

    result = this.parseSecurityScheme(json, this.components);
    this.components.setSecuritySchemaModel(key, result);
    this.schemaPointers.set(`#/components/securitySchemes/${key}`, result);

    return result;
  }

  // eslint-disable-next-line consistent-return
  private parseSecurityScheme(
    json: ObjectOrRef<SecuritySchemeObject>,
    parent: SecuritySchemaModelParent,
  ): SecuritySchemaModel {
    if (isJSONRef(json)) {
      return this.resolveSecuritySchemeFromRef(json.$ref);
    }

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
        assert.fail(`Unsupported security scheme type ${String(json)}`);
    }
  }

  private parseSecuritySchemeCommon(
    json: SecuritySchemeObject,
    securitySchema: SecuritySchemaModel,
  ): void {
    this.parseExtensionFields(securitySchema.extensions, json);
    securitySchema.description = getStringAttribute(json, 'description', false);
  }

  private parseApiKeySecurityScheme(
    json: APIKeySecuritySchemeObject,
    parent: SecuritySchemaModelParent,
  ): APIKeySecuritySchemaModel {
    if (json.type !== 'apiKey') {
      throw new Error(`Incorrent type value ${String(json.type)}`);
    }
    const result = new APIKeySecurityScheme(
      parent,
      getStringAttribute(json, 'name') as string,
      getStringAttribute(json, 'in') as 'cookie' | 'header' | 'query',
    );
    this.parseSecuritySchemeCommon(json, result);
    return result;
  }

  private parseHttpSecurityScheme(
    json: HTTPSecuritySchemeObject,
    parent: SecuritySchemaModelParent,
  ): HTTPSecuritySchemaModel {
    if (json.type !== 'http') {
      throw new Error(`Incorrent type value ${String(json.type)}`);
    }
    const result = new HTTPSecurityScheme(parent);
    this.parseSecuritySchemeCommon(json, result);
    result.scheme = this.parseSchema(json.scheme, result);
    result.bearerFormat = getStringAttribute(json, 'bearerFormat', false);
    return result;
  }

  private parseOauth2SecurityScheme(
    json: OAuth2SecuritySchemeObject,
    parent: SecuritySchemaModelParent,
  ): OAuth2SecuritySchemaModel {
    if (json.type !== 'oauth2') {
      throw new Error(`Incorrent type value ${String(json.type)}`);
    }

    const result = new OAuth2SecurityScheme(parent);
    this.parseSecuritySchemeCommon(json, result);

    const { authorizationCode, clientCredentials, implicit, password } = json.flows;
    if (authorizationCode) {
      result.flows.authorizationCode = this.parseAuthorisationCodeOAuthFlow(
        authorizationCode,
        result.flows,
      );
    }
    if (clientCredentials) {
      result.flows.clientCredentials = this.parseClientCredentialsOAuthFlow(
        clientCredentials,
        result.flows,
      );
    }
    if (implicit) {
      result.flows.implicit = this.parseImplicitOAuthFlow(implicit, result.flows);
    }
    if (password) {
      result.flows.password = this.parsePasswordOAuthFlow(password, result.flows);
    }

    return result;
  }

  private parseOAuthFlowCommon(
    json: JSONObject,
    flow:
      | OAuthAuthorisationCodeFlow
      | OAuthClientCredentialsFlow
      | OAuthImplicitFlow
      | OAuthPasswordFlow,
  ): void {
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
    parent: OAuthFlowModelParent,
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
    parent: OAuthFlowModelParent,
  ): OAuthClientCredentialsFlow {
    const result = new OAuthClientCredentialsFlow(
      parent,
      getStringAttribute(json, 'tokenUrl') as string,
    );
    this.parseOAuthFlowCommon(json, result);
    return result;
  }

  private parseImplicitOAuthFlow(
    json: JSONObject,
    parent: OAuthFlowModelParent,
  ): OAuthImplicitFlow {
    const result = new OAuthImplicitFlow(
      parent,
      getStringAttribute(json, 'authorizationUrl') as string,
    );
    this.parseOAuthFlowCommon(json, result);
    return result;
  }

  private parsePasswordOAuthFlow(
    json: JSONObject,
    parent: OAuthFlowModelParent,
  ): OAuthPasswordFlow {
    const result = new OAuthPasswordFlow(parent, getStringAttribute(json, 'tokenUrl') as string);
    this.parseOAuthFlowCommon(json, result);
    return result;
  }

  private parseOpenIdConnectScheme(
    json: OpenIdConnectSecuritySchemeObject,
    parent: SecuritySchemaModelParent,
  ): OpenIDConnectSecuritySchemaModel {
    if (json.type !== 'openIdConnect') {
      throw new Error(`Incorrent type value ${String(json.type)}`);
    }
    const result = new OpenIdConnectSecurityScheme(
      parent,
      getStringAttribute(json, 'openIdConnectUrl') as string,
    );
    this.parseSecuritySchemeCommon(json, result);
    return result;
  }

  private resolveCallbackFromRef(ref: string): CallbackModel {
    let result = this.schemaPointers.get(ref) as CallbackModel | undefined;
    if (result) {
      assert(result instanceof Callback, `Resolved reference ${ref} is not a Callback instance`);
      return result;
    }

    const key = ref.split('/').at(-1);
    assert(typeof key === 'string');

    assert(this.components);
    assert(this.componentsCallbacks);
    const json = this.componentsCallbacks[key];

    result = this.parseCallback(json, this.components);
    this.components.setCallbackModel(key, result);
    this.schemaPointers.set(`#/components/callbacks/${key}`, result);

    return result;
  }

  private parseCallback(
    json: ObjectOrRef<CallbackObject>,
    parent: CallbackModelParent,
  ): CallbackModel {
    if (isJSONRef(json)) {
      return this.resolveCallbackFromRef(json.$ref);
    }

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

  private parsePathItem(json: PathItemObject, parent: PathItemModelParent): PathItemModel {
    const unknownMethods = Object.keys(json).filter(attr => {
      return (
        !attr.startsWith('x-') &&
        !whitelistedPathItemProperties.includes(attr as PathItemOperationKey)
      );
    });
    if (unknownMethods.length) {
      throw new Error(`Unsupported HTTP method(-s) ${unknownMethods.join(',')}`);
    }

    const result = new PathItem(parent);
    this.parseExtensionFields(result.extensions, json);
    result.summary = getStringAttribute(json, 'summary', false);
    result.description = getStringAttribute(json, 'description', false);

    for (const method of operationMethods) {
      if (json[method]) {
        const operation = this.parseOperation(json[method] as OperationObject, result);
        result.operations2.set(method, operation);
      }
    }
    if (json.servers?.length) {
      for (const serverObject of json.servers) {
        this.parseServer(serverObject, result);
      }
    }
    if (json.parameters?.length) {
      for (const parameterObject of json.parameters) {
        const parameterModel = this.parseParameter(parameterObject, result);
        result.addParameterModel(parameterModel);
      }
    }
    return result;
  }

  private parseOperation(json: OperationObject, parent: OperationModelParent): OperationModel {
    if (json.responses && isEmpty(json.responses as JSONObject)) {
      throw new Error(`Operation responses field cannot be empty`);
    }

    const result = new Operation(parent);
    this.parseExtensionFields(result.extensions, json);
    if (Array.isArray(json.tags)) {
      json.tags.forEach(tag => result.tags.push(tag));
    }
    if (json.summary) {
      result.summary = json.summary;
    }
    result.description = json.description as string;
    if (json.externalDocumentation) {
      result.externalDocumentation = this.parseExternalDocumentation(
        json.externalDocumentation,
        result,
      );
    }
    if (json.operationId) {
      result.operationId = json.operationId;
    }
    if (json.parameters?.length) {
      for (const parameterJson of json.parameters) {
        const parameter = this.parseParameter(parameterJson, result);
        result.parameters.push(parameter);
      }
    }
    if (json.requestBody) {
      result.requestBody = this.parseRequestBody(json.requestBody, result);
    }

    for (const [key, responseJson] of Object.entries(json.responses)) {
      const response = this.parseResponse(
        responseJson as ObjectOrRef<ResponseObject>,
        result.responses,
      );
      if (key === 'default') {
        result.responses.default = response;
      } else {
        result.responses.codes.set(key, response);
      }
    }

    if (json.callbacks) {
      for (const [callbackId, callbackJson] of Object.entries(json.callbacks)) {
        const callback = this.parseCallback(callbackJson, result);
        result.callbacks.set(callbackId, callback);
      }
    }
    if (json.security) {
      result.setOwnSecurityRequirements(true);
      for (const securityRequirementObject of json.security) {
        this.parseSecurityRequirement(securityRequirementObject, result);
      }
    }
    return result;
  }

  private parseExternalDocumentation(
    json: ExternalDocumentationObject,
    parent: ExternalDocumentationModelParent,
  ): ExternalDocumentationModel {
    const result = new ExternalDocumentation(parent, getStringAttribute(json, 'url') as string);
    this.parseExtensionFields(result.extensions, json);
    result.description = getStringAttribute(json, 'description', false);
    return result;
  }

  private parseSecurityRequirement(
    itemJson: SecurityRequirementObject,
    parent: SecurityRequirementModelParent,
  ): void {
    const item = parent.addSecurityRequirement();
    this.parseExtensionFields(item.extensions, itemJson);
    for (const [schemeName, requiredScopes] of Object.entries(itemJson)) {
      assert(
        !requiredScopes ||
          (Array.isArray(requiredScopes) && requiredScopes.every(s => typeof s === 'string')),
        'SeecurityRequirement scopes must be an array of strings',
      );
      item.addScopes(schemeName, ...(requiredScopes as string[]));
    }
  }

  private parseTag(json: TagObject, parent: TagModelParent): TagModel {
    const result = new Tag(parent, getStringAttribute(json, 'name') as string);
    this.parseExtensionFields(result.extensions, json);
    result.description = getStringAttribute(json, 'description', false);
    if (json.externalDocs) {
      result.externalDocs = this.parseExternalDocumentation(json.externalDocs, result);
    }
    return result;
  }

  private parseDiscriminator(
    json: DiscriminatorObject,
    parent: DiscriminatorModelParent,
  ): DiscriminatorModel {
    const result = new Discriminator(parent, json.propertyName);
    this.parseExtensionFields(result.extensions, json);
    return result;
  }

  private parseXML(json: XMLObject, parent: XMLModelParent): XMLModel {
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

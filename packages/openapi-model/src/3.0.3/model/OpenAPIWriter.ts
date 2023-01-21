import assert from 'assert';
import fs from 'fs';

import yaml from 'yaml';

import type {
  APIKeySecuritySchemaModel,
  CallbackModel,
  ComponentsModel,
  ContactModel,
  CookieParameterModel,
  CookieParameterSerializationStyle,
  EncodingModel,
  ExampleModel,
  ExtensionFields,
  ExternalDocumentationModel,
  HeaderModel,
  HeaderParameterModel,
  HTTPSecuritySchemaModel,
  InfoModel,
  LicenseModel,
  LinkModel,
  LinkModelParent,
  MediaTypeModel,
  OAuth2SecuritySchemaModel,
  OpenAPIModel,
  OpenIDConnectSecuritySchemaModel,
  OperationModel,
  ParameterModel,
  PathItemModel,
  PathParameterModel,
  PathsModel,
  QueryParameterModel,
  QueryParameterSerializationStyle,
  RequestBodyModel,
  RequestBodyModelParent,
  ResponseModel,
  ResponseModelParent,
  ResponsesModel,
  SchemaModel,
  SchemaModelParent,
  SecurityRequirementModel,
  SecuritySchemaModel,
  ServerModel,
  ServerVariableModel,
  TagModel,
} from './types';
import type {
  APIKeySecuritySchemeObject,
  CallbackObject,
  ComponentsObject,
  ContactObject,
  CookieParameterObject,
  ExampleObject,
  ExternalDocumentationObject,
  HTTPSecuritySchemeObject,
  HeaderObject,
  HeaderParameterObject,
  InfoObject,
  LicenseObject,
  MediaTypeObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  PathParameterObject,
  PathsObject,
  QueryParameterObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
  SecurityRequirementObject,
  SecuritySchemeObject,
  ServerObject,
  ServerVariableObject,
  TagObject,
  OAuth2SecuritySchemeObject,
  OpenIdConnectSecuritySchemeObject,
  EncodingObject,
  LinkObject,
} from '../types';
import type { ObjectOrRef } from '@fresha/api-tools-core';

export class OpenAPIWriter {
  // maps OpenAPI schema objects to JSON pointers
  readonly schemaPointers: Map<unknown, string>;

  constructor() {
    this.schemaPointers = new Map<unknown, string>();
  }

  writeToFile(schema: OpenAPIModel, fileName: string): void {
    const openapiObject = this.write(schema);
    const text = yaml.stringify(openapiObject);
    fs.writeFileSync(fileName, text, 'utf-8');
  }

  write(openapi: OpenAPIModel): OpenAPIObject {
    this.collectSchemaPointers(openapi);

    const result: OpenAPIObject = {
      openapi: '3.0.3',
      info: this.writeInfo(openapi.info),
      paths: {},
    };
    this.writeExtensionFields(openapi.extensions, result);
    if (openapi.servers.length) {
      result.servers = openapi.servers.map(arg => this.writeServer(arg));
    }
    if (!openapi.components.isEmpty()) {
      result.components = this.writeComponents(openapi.components);
    }
    result.paths = this.writePaths(openapi.paths);
    if (openapi.security.length) {
      result.security = this.writeSecurityRequirementArray(openapi.security);
    }
    if (openapi.tags.length) {
      result.tags = openapi.tags.map(arg => this.writeTag(arg));
    }
    return result;
  }

  private collectSchemaPointers(openapi: OpenAPIModel): void {
    this.schemaPointers.clear();

    this.schemaPointers.set(openapi, '#/');
    this.schemaPointers.set(openapi.info, '#/info');
    this.schemaPointers.set(openapi.info.contact, '#/info/contact');
    this.schemaPointers.set(openapi.info.license, '#/info/license');

    this.schemaPointers.set(openapi.components, '#/components');
    for (const [key, value] of openapi.components.schemas) {
      this.schemaPointers.set(value, `#/components/schemas/${key}`);
    }
    for (const [key, value] of openapi.components.responses) {
      this.schemaPointers.set(value, `#/components/responses/${key}`);
    }
    for (const [key, value] of openapi.components.parameters) {
      this.schemaPointers.set(value, `#/components/parameters/${key}`);
    }
    for (const [key, value] of openapi.components.examples) {
      this.schemaPointers.set(value, `#/components/examples/${key}`);
    }
    for (const [key, value] of openapi.components.requestBodies) {
      this.schemaPointers.set(value, `#/components/requestBodies/${key}`);
    }
    for (const [key, value] of openapi.components.headers) {
      this.schemaPointers.set(value, `#/components/headers/${key}`);
    }
    for (const [key, value] of openapi.components.securitySchemes) {
      this.schemaPointers.set(value, `#/components/securitySchemes/${key}`);
    }
    for (const [key, value] of openapi.components.links) {
      this.schemaPointers.set(value, `#/components/links/${key}`);
    }
    for (const [key, value] of openapi.components.callbacks) {
      this.schemaPointers.set(value, `#/components/callbacks/${key}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private writeExtensionFields(
    extensionFields: ExtensionFields,
    out: Record<string, unknown>,
  ): void {
    for (const [key, value] of extensionFields) {
      out[`x-${key}`] = value;
    }
  }

  private writeInfo(info: InfoModel): InfoObject {
    const result: InfoObject = {
      title: info.title,
      version: info.version,
    };
    this.writeExtensionFields(info.extensions, result);
    if (info.description) {
      result.description = info.description;
    }
    if (info.termsOfService) {
      result.termsOfService = info.termsOfService;
    }
    const contact = this.writeContact(info.contact);
    if (contact) {
      result.contact = contact;
    }
    const license = this.writeLicense(info.license);
    if (license) {
      result.license = license;
    }
    return result;
  }

  private writeContact(contact: ContactModel): ContactObject | null {
    const result: ContactObject = {};
    this.writeExtensionFields(contact.extensions, result);
    if (contact.name) {
      result.name = contact.name;
    }
    if (contact.url) {
      result.url = contact.url;
    }
    if (contact.email) {
      result.email = contact.email;
    }
    return Object.keys(result).length ? result : null;
  }

  private writeLicense(license: LicenseModel): LicenseObject | null {
    if (license.name === 'UNLICENSED') {
      return null;
    }
    const result: LicenseObject = { name: license.name };
    this.writeExtensionFields(license.extensions, result);
    if (license.url) {
      result.url = license.url;
    }
    return result;
  }

  private writeServer(server: ServerModel): ServerObject {
    const result: ServerObject = { url: server.url };
    this.writeExtensionFields(server.extensions, result);
    if (server.description) {
      result.description = server.description;
    }
    if (server.variables.size) {
      result.variables = {};
      for (const [key, value] of server.variables.entries()) {
        result.variables[key] = this.writeServerVariable(value);
      }
    }
    return result;
  }

  private writeServerVariable(serverVar: ServerVariableModel): ServerVariableObject {
    const result: ServerVariableObject = { default: serverVar.default };
    this.writeExtensionFields(serverVar.extensions, result);
    if (serverVar.enum.size) {
      result.enum = Array.from(serverVar.enum);
    }
    if (serverVar.description) {
      result.description = serverVar.description;
    }
    return result;
  }

  private writeComponents(components: ComponentsModel): ComponentsObject {
    const result: ComponentsObject = {};
    this.writeExtensionFields(components.extensions, result);
    if (components.schemas.size) {
      result.schemas = {};
      for (const [key, schema] of components.schemas) {
        result.schemas[key] = this.writeSchema(schema, components);
      }
    }
    if (components.responses.size) {
      result.responses = {};
      for (const [key, response] of components.responses) {
        result.responses[key] = this.writeResponse(response, components);
      }
    }
    if (components.parameters.size) {
      result.parameters = {};
      for (const [key, parameter] of components.parameters) {
        result.parameters[key] = this.writeParameter(parameter);
      }
    }
    if (components.examples.size) {
      result.examples = {};
      for (const [key, example] of components.examples) {
        result.examples[key] = this.writeExample(example);
      }
    }
    if (components.requestBodies.size) {
      result.requestBodies = {};
      for (const [key, requestBody] of components.requestBodies) {
        result.requestBodies[key] = this.writeRequestBody(requestBody, components);
      }
    }
    if (components.headers.size) {
      result.headers = {};
      for (const [key, header] of components.headers) {
        result.headers[key] = this.writeHeader(header);
      }
    }
    if (components.securitySchemes.size) {
      result.securitySchemes = {};
      for (const [key, securitySchemes] of components.securitySchemes) {
        result.securitySchemes[key] = this.writeSecuritySchema(securitySchemes);
      }
    }
    if (components.links.size) {
      result.links = {};
      for (const [key, link] of components.links) {
        result.links[key] = this.writeLink(link, components);
      }
    }
    if (components.callbacks.size) {
      result.callbacks = {};
      for (const [key, callback] of components.callbacks) {
        result.callbacks[key] = this.writeCallback(callback);
      }
    }
    return result;
  }

  private writeSchema(schema: SchemaModel, node: SchemaModelParent): ObjectOrRef<SchemaObject> {
    if (node !== schema.parent) {
      const pointer = this.schemaPointers.get(schema);
      if (pointer) {
        return { $ref: pointer };
      }
    }

    const result: SchemaObject = {};
    this.writeExtensionFields(schema.extensions, result);
    if (schema.type) {
      result.type = schema.type;
    }
    if (schema.title) {
      result.title = schema.title;
    }
    if (schema.multipleOf != null) {
      result.multipleOf = schema.multipleOf;
    }
    if (schema.maximum != null) {
      result.maximum = schema.maximum;
    }
    if (schema.exclusiveMaximum != null) {
      result.exclusiveMaximum = schema.exclusiveMaximum;
    }
    if (schema.minimum != null) {
      result.minimum = schema.minimum;
    }
    if (schema.exclusiveMinimum != null) {
      result.exclusiveMinimum = schema.exclusiveMinimum;
    }
    if (schema.maxLength != null) {
      result.maxLength = schema.maxLength;
    }
    if (schema.minLength != null) {
      result.minLength = schema.minLength;
    }
    if (schema.pattern != null) {
      result.pattern = schema.pattern;
    }
    if (schema.maxItems != null) {
      result.maxItems = schema.maxItems;
    }
    if (schema.minItems != null) {
      result.minItems = schema.minItems;
    }
    if (schema.uniqueItems === true) {
      result.uniqueItems = true;
    }
    if (schema.maxProperties != null) {
      result.maxProperties = schema.maxProperties;
    }
    if (schema.minProperties != null) {
      result.minProperties = schema.minProperties;
    }
    if (schema.required.size) {
      result.required = Array.from(schema.required);
    }
    if (schema.enum != null) {
      result.enum = schema.enum;
    }
    if (schema.type != null) {
      result.type = schema.type;
    }
    if (schema.allOf?.length) {
      result.allOf = schema.allOf.map((subschema: SchemaModel) =>
        this.writeSchema(subschema, schema),
      );
    }
    if (schema.oneOf?.length) {
      result.oneOf = schema.oneOf.map((subschema: SchemaModel) =>
        this.writeSchema(subschema, schema),
      );
    }
    if (schema.anyOf?.length) {
      result.anyOf = schema.anyOf.map((subschema: SchemaModel) =>
        this.writeSchema(subschema, schema),
      );
    }
    if (schema.not != null) {
      result.not = this.writeSchema(schema.not, schema);
    }
    if (schema.items != null) {
      if (Array.isArray(schema.items)) {
        result.items = schema.items.map(subschema => this.writeSchema(subschema, schema));
      } else {
        result.items = this.writeSchema(schema.items, schema);
      }
    }
    if (schema.properties.size) {
      result.properties = {};
      for (const [key, value] of schema.properties) {
        result.properties[key] = this.writeSchema(value, schema);
      }
    }
    if (schema.additionalProperties != null) {
      if (typeof schema.additionalProperties !== 'boolean') {
        result.additionalProperties = this.writeSchema(schema.additionalProperties, schema);
      } else if (schema.additionalProperties === false) {
        result.additionalProperties = false;
      }
    }
    if (schema.description) {
      result.description = schema.description;
    }
    if (schema.format) {
      result.format = schema.format;
    }
    if (schema.nullable) {
      result.nullable = true;
    }
    if (schema.default != null) {
      result.default = schema.default;
    }
    if (schema.example != null) {
      result.example = schema.example;
    }
    return result;
  }

  private writeResponse(
    response: ResponseModel,
    node: ResponseModelParent,
  ): ObjectOrRef<ResponseObject> {
    if (node !== response.parent) {
      const pointer = this.schemaPointers.get(response);
      if (pointer) {
        return { $ref: pointer };
      }
    }

    const result: ResponseObject = { description: response.description };
    this.writeExtensionFields(response.extensions, result);
    if (response.headers.size) {
      result.headers = {};
      for (const [key, header] of response.headers) {
        result.headers[key] = this.writeHeader(header);
      }
    }
    if (response.content.size) {
      result.content = {};
      for (const [key, mediaType] of response.content) {
        result.content[key] = this.writeMediaType(mediaType);
      }
    }
    if (response.links.size) {
      result.links = {};
      for (const [key, link] of response.links) {
        result.links[key] = this.writeLink(link, response);
      }
    }
    return result;
  }

  private writeHeader(header: HeaderModel): HeaderObject {
    const result: HeaderObject = {};
    this.writeExtensionFields(header.extensions, result);
    if (header.description) {
      result.description = header.description;
    }
    if (header.required) {
      result.required = true;
    }
    if (header.deprecated) {
      result.deprecated = true;
    }
    if (header.style !== 'simple') {
      result.style = header.style;
    }
    if (header.explode) {
      result.explode = true;
    }
    if (header.schema) {
      result.schema = this.writeSchema(header.schema, header);
    }
    if (header.example) {
      result.example = header.example;
    }
    if (header.examples.size) {
      result.examples = {};
      for (const [key, example] of header.examples) {
        result.examples[key] = this.writeExample(example);
      }
    }
    if (header.content) {
      result.content = {};
      for (const [key, mediaType] of header.content) {
        result.content[key] = this.writeMediaType(mediaType);
      }
    }
    return result;
  }

  private writeExample(example: ExampleModel): ExampleObject {
    const result: ExampleObject = {};
    this.writeExtensionFields(example.extensions, result);
    if (example.summary) {
      result.summary = example.summary;
    }
    if (example.description) {
      result.description = example.description;
    }
    if (example.value) {
      result.value = example.value;
    }
    if (example.externalValue) {
      result.externalValue = example.externalValue;
    }
    return result;
  }

  private writeMediaType(mediaType: MediaTypeModel): MediaTypeObject {
    const result: MediaTypeObject = {};
    this.writeExtensionFields(mediaType.extensions, result);
    if (mediaType.schema) {
      result.schema = this.writeSchema(mediaType.schema, mediaType);
    }
    if (mediaType.example) {
      result.example = mediaType.example;
    }
    if (mediaType.examples.size) {
      result.examples = {};
      for (const [key, example] of mediaType.examples) {
        result.examples[key] = this.writeExample(example);
      }
    }
    if (mediaType.encoding.size) {
      result.encoding = {};
      for (const [key, encoding] of mediaType.encoding) {
        result.encoding[key] = this.writeEncoding(encoding);
      }
    }
    return result;
  }

  private writeEncoding(encoding: EncodingModel): EncodingObject {
    const result: EncodingObject = {};
    this.writeExtensionFields(encoding.extensions, result);
    if (encoding.contentType) {
      result.contentType = encoding.contentType;
    }
    if (encoding.headers.size) {
      result.headers = {};
      for (const [key, header] of encoding.headers) {
        result.headers[key] = this.writeHeader(header);
      }
    }
    if (encoding.style) {
      result.style = encoding.style as QueryParameterSerializationStyle;
    }
    result.explode = encoding.explode;
    result.allowReserved = encoding.allowReserved;
    return result;
  }

  private writeLink(link: LinkModel, node: LinkModelParent): ObjectOrRef<LinkObject> {
    if (node !== link.parent) {
      const pointer = this.schemaPointers.get(link);
      if (pointer) {
        return { $ref: pointer };
      }
    }

    const result: LinkObject = {};
    this.writeExtensionFields(link.extensions, result);
    if (link.operationRef) {
      result.operationRef = link.operationRef;
    }
    if (link.operationId) {
      result.operationId = link.operationId;
    }
    if (link.parameters.size) {
      result.parameters = Object.fromEntries(link.parameters.entries());
    }
    if (link.requestBody) {
      result.requestBody = link.requestBody;
    }
    if (link.description) {
      result.description = link.description;
    }
    if (link.server) {
      result.server = this.writeServer(link.server);
    }
    return result;
  }

  private writeParameterCommon(parameter: PathParameterModel, result: PathParameterObject): void;
  private writeParameterCommon(parameter: QueryParameterModel, result: QueryParameterObject): void;
  private writeParameterCommon(
    parameter: HeaderParameterModel,
    result: HeaderParameterObject,
  ): void;

  private writeParameterCommon(
    parameter: CookieParameterModel,
    result: CookieParameterObject,
  ): void;

  private writeParameterCommon(
    parameter:
      | PathParameterModel
      | QueryParameterModel
      | HeaderParameterModel
      | CookieParameterModel,
    result:
      | PathParameterObject
      | QueryParameterObject
      | HeaderParameterObject
      | CookieParameterObject,
  ): void {
    this.writeExtensionFields(parameter.extensions, result);
    if (parameter.description) {
      result.description = parameter.description;
    }
    if (parameter.deprecated) {
      result.deprecated = true;
    }
    if (parameter.schema) {
      result.schema = this.writeSchema(parameter.schema, result as unknown as CookieParameterModel);
    }
    if (parameter.content.size) {
      result.content = {};
      for (const [key, mediaType] of parameter.content) {
        result.content[key] = this.writeMediaType(mediaType);
      }
    }
    if (parameter.example) {
      result.example = parameter.example;
    }
    if (parameter.examples.size) {
      result.examples = {};
      for (const [key, example] of parameter.examples) {
        result.examples[key] = this.writeExample(example);
      }
    }
  }

  private writePathParameter(param: PathParameterModel): PathParameterObject {
    const result: PathParameterObject = { name: param.name, in: param.in, required: true };
    this.writeParameterCommon(param, result);
    if (param.style !== 'simple') {
      result.style = param.style;
    }
    if (param.explode) {
      result.explode = true;
    }
    return result;
  }

  private writeQueryParameter(param: QueryParameterModel): QueryParameterObject {
    const result: QueryParameterObject = { name: param.name, in: param.in };
    this.writeParameterCommon(param, result);
    if (param.required) {
      result.required = true;
    }
    if (param.style !== 'form') {
      result.style = param.style;
    }
    if (param.explode !== (param.style === 'form')) {
      result.explode = param.explode;
    }
    if (param.allowEmptyValue) {
      result.allowEmptyValue = true;
    }
    if (param.allowReserved) {
      result.allowReserved = true;
    }
    return result;
  }

  private writeHeaderParameter(param: HeaderParameterModel): HeaderParameterObject {
    const result: HeaderParameterObject = { name: param.name, in: param.in };
    this.writeParameterCommon(param, result);
    if (param.required) {
      result.required = true;
    }
    if (param.style !== 'simple') {
      result.style = param.style;
    }
    if (!param.explode) {
      result.explode = false;
    }
    return result;
  }

  private writeCookieParameter(param: CookieParameterModel): CookieParameterObject {
    const result: CookieParameterObject = { name: param.name, in: param.in };
    this.writeParameterCommon(param, result);
    if (param.required) {
      result.required = true;
    }
    if (param.style !== 'form') {
      result.style = param.style as CookieParameterSerializationStyle;
    }
    if (param.explode !== (param.style === 'form')) {
      result.explode = param.explode;
    }
    return result;
  }

  // eslint-disable-next-line consistent-return
  private writeParameter(parameter: ParameterModel): ParameterObject {
    switch (parameter.in) {
      case 'path':
        return this.writePathParameter(parameter);
      case 'query':
        return this.writeQueryParameter(parameter);
      case 'header':
        return this.writeHeaderParameter(parameter);
      case 'cookie':
        return this.writeCookieParameter(parameter);
      default:
        assert.fail(
          `Unsupported parameter type ${String((parameter as Record<string, string>).in)}`,
        );
    }
  }

  private writeRequestBody(
    requestBody: RequestBodyModel,
    node: RequestBodyModelParent,
  ): ObjectOrRef<RequestBodyObject> {
    if (node !== requestBody.parent) {
      const pointer = this.schemaPointers.get(requestBody);
      if (pointer) {
        return { $ref: pointer };
      }
    }

    const result: RequestBodyObject = {
      content: {},
    };
    this.writeExtensionFields(requestBody.extensions, result);
    if (requestBody.description) {
      result.description = requestBody.description;
    }
    if (requestBody.content.size) {
      result.content = {};
      for (const [key, mediaType] of requestBody.content) {
        result.content[key] = this.writeMediaType(mediaType);
      }
    }
    if (requestBody.required) {
      result.required = true;
    }
    return result;
  }

  private writeSecuritySchemaCommon(
    scheme:
      | APIKeySecuritySchemaModel
      | HTTPSecuritySchemaModel
      | OAuth2SecuritySchemaModel
      | OpenIDConnectSecuritySchemaModel,
    result:
      | APIKeySecuritySchemeObject
      | HTTPSecuritySchemeObject
      | OAuth2SecuritySchemeObject
      | OpenIdConnectSecuritySchemeObject,
  ): void {
    this.writeExtensionFields(scheme.extensions, result);
    if (scheme.description) {
      result.description = scheme.description;
    }
  }

  private writeApiKeySecuritySchema(scheme: APIKeySecuritySchemaModel): APIKeySecuritySchemeObject {
    const result: APIKeySecuritySchemeObject = {
      type: scheme.type,
      name: scheme.name,
      in: scheme.in,
    };
    this.writeSecuritySchemaCommon(scheme, result);
    return result;
  }

  private writeHttpSecuritySchema(scheme: HTTPSecuritySchemaModel): HTTPSecuritySchemeObject {
    const result: HTTPSecuritySchemeObject = {
      type: scheme.type,
      scheme: this.writeSchema(scheme.scheme, scheme),
    };
    this.writeSecuritySchemaCommon(scheme, result);
    if (scheme.bearerFormat) {
      result.bearerFormat = scheme.bearerFormat;
    }
    return result;
  }

  private writeOAuth2SecuritySchema(scheme: OAuth2SecuritySchemaModel): OAuth2SecuritySchemeObject {
    const result: OAuth2SecuritySchemeObject = { type: scheme.type, flows: {} };
    this.writeSecuritySchemaCommon(scheme, result);
    if (scheme.flows.authorizationCode) {
      result.flows.authorizationCode = {
        scopes: Object.fromEntries(scheme.flows.authorizationCode.scopes.entries()),
        authorizationUrl: scheme.flows.authorizationCode.authorizationUrl,
        tokenUrl: scheme.flows.authorizationCode.tokenUrl,
      };
    }
    if (scheme.flows.clientCredentials) {
      result.flows.clientCredentials = {
        scopes: Object.fromEntries(scheme.flows.clientCredentials.scopes.entries()),
        tokenUrl: scheme.flows.clientCredentials.tokenUrl,
      };
    }
    if (scheme.flows.implicit) {
      result.flows.implicit = {
        scopes: Object.fromEntries(scheme.flows.implicit.scopes.entries()),
        authorizationUrl: scheme.flows.implicit.authorizationUrl,
      };
    }
    if (scheme.flows.password) {
      result.flows.password = {
        scopes: Object.fromEntries(scheme.flows.password.scopes.entries()),
        tokenUrl: scheme.flows.password.tokenUrl,
      };
    }
    return result;
  }

  private writeOpenIdConnectSecuritySchema(
    scheme: OpenIDConnectSecuritySchemaModel,
  ): OpenIdConnectSecuritySchemeObject {
    const result: OpenIdConnectSecuritySchemeObject = {
      type: scheme.type,
      openIdConnectUrl: scheme.openIdConnectUrl,
    };
    this.writeSecuritySchemaCommon(scheme, result);
    return result;
  }

  private writeSecuritySchema(securitySchema: SecuritySchemaModel): SecuritySchemeObject {
    switch (securitySchema.type) {
      case 'apiKey':
        return this.writeApiKeySecuritySchema(securitySchema);
      case 'http':
        return this.writeHttpSecuritySchema(securitySchema);
      case 'oauth2':
        return this.writeOAuth2SecuritySchema(securitySchema);
      case 'openIdConnect':
        return this.writeOpenIdConnectSecuritySchema(securitySchema);
      default:
        throw new Error(`Unsupported security schema type ${String(securitySchema)}`);
    }
  }

  private writeCallback(callback: CallbackModel): CallbackObject {
    const result: CallbackObject = {};
    this.writeExtensionFields(callback.extensions, result);
    for (const [expr, pathItem] of callback.paths) {
      result[expr] = this.writePathItem(pathItem);
    }
    return result;
  }

  private writePathItem(pathItem: PathItemModel): PathItemObject {
    const result: PathItemObject = {};
    this.writeExtensionFields(pathItem.extensions, result);
    if (pathItem.summary) {
      result.summary = pathItem.summary;
    }
    if (pathItem.description) {
      result.description = pathItem.description;
    }
    for (const [operName, operDesc] of pathItem.operations()) {
      result[operName] = this.writeOperation(operDesc);
    }
    if (pathItem.servers?.length) {
      result.servers = pathItem.servers.map(arg => this.writeServer(arg));
    }
    if (pathItem.parameters.length) {
      result.parameters = pathItem.parameters.map(arg => this.writeParameter(arg));
    }
    return result;
  }

  private writeOperation(operation: OperationModel): OperationObject {
    const result: OperationObject = {
      responses: this.writeResponses(operation.responses),
    };
    this.writeExtensionFields(operation.extensions, result);
    if (operation.tags.length) {
      result.tags = operation.tags.slice();
    }
    if (operation.summary) {
      result.summary = operation.summary;
    }
    if (operation.description) {
      result.description = operation.description;
    }
    if (operation.externalDocumentation) {
      result.externalDocumentation = this.writeExternalDocs(operation.externalDocumentation);
    }
    if (operation.operationId) {
      result.operationId = operation.operationId;
    }
    if (operation.parameters.length) {
      result.parameters = operation.parameters.map(arg => this.writeParameter(arg));
    }
    if (operation.requestBody) {
      result.requestBody = this.writeRequestBody(operation.requestBody, operation);
    }
    if (operation.callbacks?.size) {
      result.callbacks = {};
      for (const [name, callback] of operation.callbacks) {
        result.callbacks[name] = this.writeCallback(callback);
      }
    }
    if (operation.deprecated) {
      result.deprecated = operation.deprecated;
    }
    if (operation.security) {
      result.security = this.writeSecurityRequirementArray(operation.security);
    }
    if (operation.servers?.length) {
      result.servers = operation.servers.map(arg => this.writeServer(arg));
    }
    return result;
  }

  private writeExternalDocs(externalDocs: ExternalDocumentationModel): ExternalDocumentationObject {
    const result: ExternalDocumentationObject = { url: externalDocs.url };
    this.writeExtensionFields(externalDocs.extensions, result);
    if (externalDocs.description) {
      result.description = externalDocs.description;
    }
    return result;
  }

  private writeResponses(responses: ResponsesModel): ResponsesObject {
    const result: ResponsesObject = {};
    this.writeExtensionFields(responses.extensions, result);
    if (responses.codes.size) {
      for (const [httpStatus, response] of responses.codes) {
        result[Number(httpStatus)] = this.writeResponse(response, responses);
      }
    }
    if (responses.default) {
      result.default = this.writeResponse(responses.default, responses);
    }
    return result;
  }

  private writeSecurityRequirementArray(
    security: ReadonlyArray<SecurityRequirementModel>,
  ): SecurityRequirementObject[] {
    return security.map(item => this.writeSecurityRequirement(item));
  }

  private writeSecurityRequirement(
    securityItem: SecurityRequirementModel,
  ): SecurityRequirementObject {
    const result: SecurityRequirementObject = {};
    this.writeExtensionFields(securityItem.extensions, result);
    for (const [key, scopes] of securityItem.scopes) {
      result[key] = scopes.slice();
    }
    return result;
  }

  private writePaths(paths: PathsModel): PathsObject {
    const result: PathsObject = {};
    this.writeExtensionFields(paths.extensions, result);
    for (const [pathUrlExp, pathItem] of paths) {
      result[pathUrlExp] = this.writePathItem(pathItem);
    }
    return result;
  }

  private writeTag(tag: TagModel): TagObject {
    const result: TagObject = { name: tag.name };
    if (tag.description) {
      result.description = tag.description;
    }
    if (tag.externalDocs) {
      result.externalDocs = this.writeExternalDocs(tag.externalDocs);
    }
    this.writeExtensionFields(tag.extensions, result);
    return result;
  }

  // dumpXML(xml: XML): JSONObject {
  //   const result = this.writeExtensionFields(xml.extensionFields);
  //   result.name = xml.name;
  //   result.namespace = xml.namespace;
  //   result.prefix = xml.prefix;
  //   result.attribute = xml.attribute;
  //   result.wrapped = xml.wrapped;
  //   return result;
  // }

  // dumpDiscriminator(discriminator: Discriminator): JSONValue {
  //   const result = this.writeExtensionFields(discriminator.extensionFields);
  //   result.propertyName = discriminator.propertyName;
  //   if (discriminator.mapping.size) {
  //     result.mapping = Object.fromEntries(discriminator.mapping.entries());
  //   }
  //   return result;
  // }
}

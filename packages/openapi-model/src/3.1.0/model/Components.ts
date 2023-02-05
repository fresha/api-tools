import assert from 'assert';

import { CommonMarkString, URLString } from '@fresha/api-tools-core';

import { Callback } from './Callback';
import { Example } from './Example';
import { Header } from './Header';
import { Link } from './Link';
import { Node } from './Node';
import {
  CookieParameter,
  HeaderParameter,
  Parameter,
  PathParameter,
  QueryParameter,
} from './Parameter';
import { PathItem } from './PathItem';
import { RequestBody } from './RequestBody';
import { Response } from './Response';
import { Schema } from './Schema';
import {
  APIKeySecuritySchema,
  HTTPSecuritySchema,
  MutualTLSSecuritySchema,
  OAuth2SecuritySchema,
  OpenIDConnectSecuritySchema,
  SecuritySchema,
} from './SecuritySchema';

import type { OpenAPI } from './OpenAPI';
import type {
  APIKeySecuritySchemaLocation,
  ComponentsModel,
  ParameterLocation,
  SecuritySchemaType,
} from './types';

type ComponentsParent = OpenAPI;

export class Components extends Node<ComponentsParent> implements ComponentsModel {
  #schemas: Map<string, Schema>;
  #responses: Map<string, Response>;
  #parameters: Map<string, Parameter>;
  #examples: Map<string, Example>;
  #requestBodies: Map<string, RequestBody>;
  #headers: Map<string, Header>;
  #securitySchemas: Map<string, SecuritySchema>;
  #links: Map<string, Link>;
  #callbacks: Map<string, Callback>;
  #pathItems: Map<string, PathItem>;

  constructor(parent: ComponentsParent) {
    super(parent);
    this.#schemas = new Map<string, Schema>();
    this.#responses = new Map<string, Response>();
    this.#parameters = new Map<string, Parameter>();
    this.#examples = new Map<string, Example>();
    this.#requestBodies = new Map<string, RequestBody>();
    this.#headers = new Map<string, Header>();
    this.#securitySchemas = new Map<string, SecuritySchema>();
    this.#links = new Map<string, Link>();
    this.#callbacks = new Map<string, Callback>();
    this.#pathItems = new Map<string, PathItem>();
  }

  get schemaCount(): number {
    return this.#schemas.size;
  }

  schemaKeys(): IterableIterator<string> {
    return this.#schemas.keys();
  }

  schemas(): IterableIterator<[string, Schema]> {
    return this.#schemas.entries();
  }

  hasSchema(key: string): boolean {
    return this.#schemas.has(key);
  }

  addSchema(key: string): Schema {
    assert(!this.hasSchema(key), `Schema for key '${key}' already exists`);
    const schema = new Schema(this);
    this.#schemas.set(key, schema);
    return schema;
  }

  deleteSchema(key: string): void {
    const schema = this.#schemas.get(key);
    if (schema) {
      schema.dispose();
      this.#schemas.delete(key);
    }
  }

  clearSchemas(): void {
    this.#schemas.forEach(s => s.dispose());
    this.#schemas.clear();
  }

  get responseCount(): number {
    return this.#responses.size;
  }

  responseKeys(): IterableIterator<string> {
    return this.#responses.keys();
  }

  responses(): IterableIterator<[string, Response]> {
    return this.#responses.entries();
  }

  hasResponse(key: string): boolean {
    return this.#responses.has(key);
  }

  addResponse(key: string, description: CommonMarkString): Response {
    assert(!this.hasResponse(key), `Response for key '${key}' already exists`);
    const response = new Response(this, description);
    this.#responses.set(key, response);
    return response;
  }

  deleteResponse(key: string): void {
    const response = this.#responses.get(key);
    if (response) {
      response.dispose();
      this.#responses.delete(key);
    }
  }

  clearResponse(): void {
    this.#responses.forEach(r => r.dispose());
    this.#responses.clear();
  }

  get parameterCount(): number {
    return this.#parameters.size;
  }

  parameterKeys(): IterableIterator<string> {
    return this.#parameters.keys();
  }

  parameters(): IterableIterator<[string, Parameter]> {
    return this.#parameters.entries();
  }

  hasParameter(key: string): boolean {
    return this.#parameters.has(key);
  }

  addParameter(key: string, name: string, location: 'path'): PathParameter;
  addParameter(key: string, name: string, location: 'query'): QueryParameter;
  addParameter(key: string, name: string, location: 'header'): HeaderParameter;
  addParameter(key: string, name: string, location: 'cookie'): CookieParameter;
  addParameter(key: string, name: string, location: ParameterLocation): Parameter {
    assert(!this.hasParameter(key), `Parameter for key '${key}' already exists`);
    let result: Parameter;
    switch (location) {
      case 'path':
        result = new PathParameter(this, name);
        break;
      case 'query':
        result = new QueryParameter(this, name);
        break;
      case 'header':
        result = new HeaderParameter(this, name);
        break;
      case 'cookie':
        result = new CookieParameter(this, name);
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        assert.fail(`Invalid parameter location '${location}'`);
    }
    this.#parameters.set(key, result);
    return result;
  }

  deleteParameter(key: string): void {
    const parameter = this.#parameters.get(key);
    if (parameter) {
      parameter.dispose();
      this.#parameters.delete(key);
    }
  }

  clearParameters(): void {
    this.#parameters.forEach(p => p.dispose());
    this.#parameters.clear();
  }

  get exampleCount(): number {
    return this.#examples.size;
  }

  exampleKeys(): IterableIterator<string> {
    return this.#examples.keys();
  }

  examples(): IterableIterator<[string, Example]> {
    return this.#examples.entries();
  }

  hasExample(key: string): boolean {
    return this.#examples.has(key);
  }

  addExample(key: string): Example {
    assert(!this.hasExample(key), `Example for key '${key}' already exists`);
    const result = new Example(this);
    this.#examples.set(key, result);
    return result;
  }

  deleteExample(key: string): void {
    const example = this.#examples.get(key);
    if (example) {
      example.dispose();
      this.#examples.delete(key);
    }
  }

  clearExamples(): void {
    this.#examples.forEach(e => e.dispose());
    this.#examples.clear();
  }

  get requestBodyCount(): number {
    return this.#requestBodies.size;
  }

  requestBodyKeys(): IterableIterator<string> {
    return this.#requestBodies.keys();
  }

  requestBodies(): IterableIterator<[string, RequestBody]> {
    return this.#requestBodies.entries();
  }

  hasRequestBody(key: string): boolean {
    return this.#requestBodies.has(key);
  }

  addRequestBody(key: string): RequestBody {
    assert(!this.hasRequestBody(key), `Request body for key '${key}' already exists`);
    const result = new RequestBody(this);
    this.#requestBodies.set(key, result);
    return result;
  }

  deleteRequestBody(key: string): void {
    const requestBody = this.#requestBodies.get(key);
    if (requestBody) {
      requestBody.dispose();
      this.#requestBodies.delete(key);
    }
  }

  clearRequestBodies(): void {
    this.#requestBodies.forEach(rb => rb.dispose());
    this.#requestBodies.clear();
  }

  get headerCount(): number {
    return this.#headers.size;
  }

  headerKeys(): IterableIterator<string> {
    return this.#headers.keys();
  }

  headers(): IterableIterator<[string, Header]> {
    return this.#headers.entries();
  }

  hasHeader(key: string): boolean {
    return this.#headers.has(key);
  }

  addHeader(key: string): Header {
    assert(!this.hasHeader(key), `Header for the key '${key}' already exists`);
    const result = new Header(this);
    this.#headers.set(key, result);
    return result;
  }

  deleteHeader(key: string): void {
    const header = this.#headers.get(key);
    if (header) {
      header.dispose();
      this.#headers.delete(key);
    }
  }

  clearHeaders(): void {
    this.#headers.forEach(h => h.dispose());
    this.#headers.clear();
  }

  get securitySchemaCount(): number {
    return this.#securitySchemas.size;
  }

  securitySchemaKeys(): IterableIterator<string> {
    return this.#securitySchemas.keys();
  }

  securitySchemas(): IterableIterator<[string, SecuritySchema]> {
    return this.#securitySchemas.entries();
  }

  hasSecuritySchema(key: string): boolean {
    return this.#securitySchemas.has(key);
  }

  addSecuritySchema(
    key: string,
    type: 'apiKey',
    name: string,
    location: APIKeySecuritySchemaLocation,
  ): APIKeySecuritySchema;

  addSecuritySchema(key: string, type: 'http'): HTTPSecuritySchema;
  addSecuritySchema(key: string, type: 'mutualTLS'): MutualTLSSecuritySchema;
  addSecuritySchema(key: string, type: 'oauth2'): OAuth2SecuritySchema;
  addSecuritySchema(
    key: string,
    type: 'openIdConnect',
    connectUrl: URLString,
  ): OpenIDConnectSecuritySchema;

  addSecuritySchema(
    key: string,
    type: SecuritySchemaType,
    nameOrConnectUrl?: string,
    location?: APIKeySecuritySchemaLocation,
  ): SecuritySchema {
    assert(!this.hasSecuritySchema(key), `Security schema for key '${key}' already exists`);
    let result: SecuritySchema;
    switch (type) {
      case 'apiKey':
        assert(nameOrConnectUrl, 'Name of an API Key schema cannot be empty');
        assert(location, 'Location of an API key schema cannot be empty');
        result = new APIKeySecuritySchema(this, nameOrConnectUrl, location);
        break;
      case 'http':
        result = new HTTPSecuritySchema(this);
        break;
      case 'mutualTLS':
        result = new MutualTLSSecuritySchema(this);
        break;
      case 'oauth2':
        result = new OAuth2SecuritySchema(this);
        break;
      case 'openIdConnect':
        assert(nameOrConnectUrl, 'Connect URL of an OpenIDConnect schema cannot be empty');
        result = new OpenIDConnectSecuritySchema(this, nameOrConnectUrl);
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        assert.fail(`Unsupported security schema type '${type}'`);
    }
    this.#securitySchemas.set(key, result);
    return result;
  }

  deleteSecuritySchema(key: string): void {
    const securitySchema = this.#securitySchemas.get(key);
    if (securitySchema) {
      securitySchema.dispose();
      this.#securitySchemas.delete(key);
    }
  }

  clearSecuritySchemas(): void {
    this.#securitySchemas.forEach(s => s.dispose());
    this.#securitySchemas.clear();
  }

  get linkCount(): number {
    return this.#links.size;
  }

  linkKeys(): IterableIterator<string> {
    return this.#links.keys();
  }

  links(): IterableIterator<[string, Link]> {
    return this.#links.entries();
  }

  hasLink(key: string): boolean {
    return this.#links.has(key);
  }

  addLink(key: string): Link {
    assert(!this.hasLink(key), `Link for key '${key}' already exists`);
    const result = new Link(this);
    this.#links.set(key, result);
    return result;
  }

  deleteLink(key: string): void {
    const result = this.#links.get(key);
    if (result) {
      result.dispose();
      this.#links.delete(key);
    }
  }

  clearLinks(): void {
    this.#links.forEach(l => l.dispose());
    this.#links.clear();
  }

  get callbackCount(): number {
    return this.#callbacks.size;
  }

  callbackKeys(): IterableIterator<string> {
    return this.#callbacks.keys();
  }

  callbacks(): IterableIterator<[string, Callback]> {
    return this.#callbacks.entries();
  }

  hasCallback(key: string): boolean {
    return this.#callbacks.has(key);
  }

  addCallback(key: string): Callback {
    assert(!this.hasCallback(key), `Callback for key '${key}' already exists`);
    const result = new Callback(this);
    this.#callbacks.set(key, result);
    return result;
  }

  deleteCallback(key: string): void {
    const callback = this.#callbacks.get(key);
    if (callback) {
      callback.dispose();
      this.#callbacks.delete(key);
    }
  }

  clearCallbacks(): void {
    this.#callbacks.forEach(c => c.dispose());
    this.#callbacks.clear();
  }

  get pathItemCount(): number {
    return this.#pathItems.size;
  }

  pathItemKeys(): IterableIterator<string> {
    return this.#pathItems.keys();
  }

  pathItems(): IterableIterator<[string, PathItem]> {
    return this.#pathItems.entries();
  }

  hasPathItem(key: string): boolean {
    return this.#pathItems.has(key);
  }

  addPathItem(key: string): PathItem {
    assert(!this.hasPathItem(key), `Path item for key '${key}' already exists`);
    const result = new PathItem(this);
    this.#pathItems.set(key, result);
    return result;
  }

  deletePathItem(key: string): void {
    const pathItem = this.#pathItems.get(key);
    if (pathItem) {
      pathItem.dispose();
      this.#pathItems.delete(key);
    }
  }

  clearPathItems(): void {
    this.#pathItems.forEach(p => p.dispose());
    this.#pathItems.clear();
  }
}

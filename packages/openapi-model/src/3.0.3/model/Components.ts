import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Callback } from './Callback';
import { Example } from './Example';
import { Header } from './Header';
import { Link } from './Link';
import {
  CookieParameter,
  HeaderParameter,
  Parameter,
  PathParameter,
  QueryParameter,
} from './Parameter';
import { RequestBody } from './RequestBody';
import { Response } from './Response';
import { Schema, SchemaFactory } from './Schema';
import {
  APIKeySecurityScheme,
  HTTPSecurityScheme,
  OAuth2SecurityScheme,
  OpenIdConnectSecurityScheme,
  SecuritySchema,
} from './SecurityScheme';

import type { ComponentsModel, ComponentsModelParent, CreateSchemaOptions } from './types';
import type { CommonMarkString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#components-object
 */
export class Components extends BasicNode<ComponentsModelParent> implements ComponentsModel {
  readonly #schemas: Map<string, Schema>;
  readonly #responses: Map<string, Response>;
  readonly #parameters: Map<string, Parameter>;
  readonly #examples: Map<string, Example>;
  readonly #requestBodies: Map<string, RequestBody>;
  readonly #headers: Map<string, Header>;
  readonly #securitySchemes: Map<string, SecuritySchema>;
  readonly #links: Map<string, Link>;
  readonly #callbacks: Map<string, Callback>;

  constructor(parent: ComponentsModelParent) {
    super(parent);
    this.#schemas = new Map<string, Schema>();
    this.#responses = new Map<string, Response>();
    this.#parameters = new Map<string, Parameter>();
    this.#examples = new Map<string, Example>();
    this.#requestBodies = new Map<string, RequestBody>();
    this.#headers = new Map<string, Header>();
    this.#securitySchemes = new Map<string, SecuritySchema>();
    this.#links = new Map<string, Link>();
    this.#callbacks = new Map<string, Callback>();
  }

  isEmpty(): boolean {
    return (
      !this.#schemas.size &&
      !this.#responses.size &&
      !this.#parameters.size &&
      !this.#examples.size &&
      !this.#requestBodies.size &&
      !this.#headers.size &&
      !this.#securitySchemes.size &&
      !this.#links.size &&
      !this.#callbacks.size
    );
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

  hasSchema(name: string): boolean {
    return this.#schemas.has(name);
  }

  getSchema(name: string): Schema | undefined {
    return this.#schemas.get(name);
  }

  getSchemaOrThrow(name: string): Schema {
    const result = this.getSchema(name);
    assert(result);
    return result;
  }

  setSchemaModel(name: string, model: Schema): void {
    assert(!this.#schemas.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.#schemas.values()).includes(model));
    this.#schemas.set(name, model);
  }

  setSchema(name: string, options: CreateSchemaOptions = null): Schema {
    assert(!this.#schemas.has(name));
    const result = SchemaFactory.create(this, options) as Schema;
    result.title = name;
    this.#schemas.set(name, result);
    return result;
  }

  deleteSchema(name: string): void {
    this.#schemas.delete(name);
  }

  clearSchemas(): void {
    this.#schemas.clear();
  }

  sortSchemas(sorter: (entry1: [string, Schema], entry2: [string, Schema]) => number): void {
    const entries = Array.from(this.#schemas.entries()).sort(sorter);
    this.#schemas.clear();
    for (const [key, value] of entries) {
      this.#schemas.set(key, value);
    }
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

  hasResponse(name: string): boolean {
    return this.#responses.has(name);
  }

  getResponse(name: string): Response | undefined {
    return this.#responses.get(name);
  }

  getResponseOrThrow(name: string): Response {
    const result = this.getResponse(name);
    assert(result);
    return result;
  }

  setResponseModel(name: string, model: Response): void {
    assert(!this.#responses.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.#responses.values()).includes(model));
    this.#responses.set(name, model);
  }

  setResponse(name: string, description: CommonMarkString): Response {
    const result = new Response(this, description);
    this.#responses.set(name, result);
    return result;
  }

  deleteResponse(name: string): void {
    this.#responses.delete(name);
  }

  clearResponses(): void {
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

  hasParameter(name: string): boolean {
    return this.#parameters.has(name);
  }

  getParameter(name: string): Parameter | undefined {
    return this.#parameters.get(name);
  }

  getParameterOrThrow(name: string): Parameter {
    const result = this.getParameter(name);
    assert(result);
    return result;
  }

  setParameterModel(name: string, model: Parameter): void {
    assert(!this.#parameters.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.#parameters.values()).includes(model));
    this.#parameters.set(name, model);
  }

  setParameter(name: string, kind: Parameter['in'], paramName: string): Parameter {
    let result: PathParameter | QueryParameter | HeaderParameter | CookieParameter;
    switch (kind) {
      case 'path':
        result = new PathParameter(this, paramName);
        break;
      case 'query':
        result = new QueryParameter(this, paramName);
        break;
      case 'header':
        result = new HeaderParameter(this, paramName);
        break;
      case 'cookie':
        result = new CookieParameter(this, paramName);
        break;
      default:
        throw new Error(`Unknown parameter type ${String(kind)}`);
    }
    this.#parameters.set(name, result);
    return result;
  }

  deleteParameter(name: string): void {
    this.#parameters.delete(name);
  }

  clearParameters(): void {
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

  hasExample(name: string): boolean {
    return this.#examples.has(name);
  }

  getExample(name: string): Example | undefined {
    return this.#examples.get(name);
  }

  getExampleOrThrow(name: string): Example {
    const result = this.getExample(name);
    assert(result);
    return result;
  }

  setExampleModel(name: string, model: Example): void {
    assert(!this.#examples.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.#examples.values()).includes(model));
    this.#examples.set(name, model);
  }

  setExample(name: string): Example {
    const example = new Example(this);
    this.#examples.set(name, example);
    return example;
  }

  deleteExample(name: string): void {
    this.#examples.delete(name);
  }

  clearExamples(): void {
    this.#examples.clear();
  }

  get requestBodyCount(): number {
    return this.#requestBodies.size;
  }

  requestBodyKeys(): IterableIterator<string> {
    return this.#requestBodies.keys();
  }

  requestBodies(): Iterable<[string, RequestBody]> {
    return this.#requestBodies.entries();
  }

  hasRequestBody(name: string): boolean {
    return this.#requestBodies.has(name);
  }

  getRequestBody(name: string): RequestBody | undefined {
    return this.#requestBodies.get(name);
  }

  getRequestBodyOrThrow(name: string): RequestBody {
    const result = this.getRequestBody(name);
    assert(result, `Cannot find request body for key '${name}'`);
    return result;
  }

  setRequestBodyModel(name: string, model: RequestBody): void {
    assert(!this.#requestBodies.has(name), `Request body named '${name}' already exists`);
    assert.equal(model.parent, this, `Request body named '${name}' has wrong parent`);
    assert(
      !Array.from(this.#requestBodies.values()).includes(model),
      `Request body named '${name}' already exists under a different key`,
    );
    this.#requestBodies.set(name, model);
  }

  setRequestBody(name: string): RequestBody {
    const result = new RequestBody(this);
    this.#requestBodies.set(name, result);
    return result;
  }

  deleteRequestBody(name: string): void {
    this.#requestBodies.delete(name);
  }

  clearRequestBodies(): void {
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

  hasHeader(name: string): boolean {
    return this.#headers.has(name);
  }

  getHeader(name: string): Header | undefined {
    return this.#headers.get(name);
  }

  getHeaderOrThrow(name: string): Header {
    const result = this.getHeader(name);
    assert(result);
    return result;
  }

  setHeaderModel(name: string, model: Header): void {
    assert(!this.#headers.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.#headers.values()).includes(model));
    this.#headers.set(name, model);
  }

  setHeader(name: string): Header {
    const result = new Header(this);
    this.#headers.set(name, result);
    return result;
  }

  deleteHeader(name: string): void {
    this.#headers.delete(name);
  }

  clearHeaders(): void {
    this.#headers.clear();
  }

  get securitySchemaCount(): number {
    return this.#securitySchemes.size;
  }

  securitySchemaKeys(): IterableIterator<string> {
    return this.#securitySchemes.keys();
  }

  securitySchemas(): IterableIterator<[string, SecuritySchema]> {
    return this.#securitySchemes.entries();
  }

  hasSecuritySchema(name: string): boolean {
    return this.#securitySchemes.has(name);
  }

  getSecuritySchema(name: string): SecuritySchema | undefined {
    return this.#securitySchemes.get(name);
  }

  getSecuritySchemaOrThrow(name: string): SecuritySchema {
    const result = this.getSecuritySchema(name);
    assert(result);
    return result;
  }

  setSecuritySchemaModel(name: string, model: SecuritySchema): void {
    assert(!this.#securitySchemes.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.#securitySchemes.values()).includes(model));
    this.#securitySchemes.set(name, model);
  }

  setSecuritySchema(name: string, kind: SecuritySchema['type']): SecuritySchema {
    let result: SecuritySchema;
    switch (kind) {
      case 'apiKey':
        result = new APIKeySecurityScheme(this, name, 'header');
        break;
      case 'http':
        result = new HTTPSecurityScheme(this, Schema.create(this));
        break;
      case 'oauth2':
        result = new OAuth2SecurityScheme(this);
        break;
      case 'openIdConnect':
        result = new OpenIdConnectSecurityScheme(this, 'http://www.example.com');
        break;
      default:
        assert.fail(`Unsupported security scheme type ${String(kind)}`);
    }
    this.#securitySchemes.set(name, result);
    return result;
  }

  deleteSecuritySchema(name: string): void {
    this.#securitySchemes.delete(name);
  }

  clearSecuritySchemes(): void {
    this.#securitySchemes.clear();
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

  hasLink(name: string): boolean {
    return this.#links.has(name);
  }

  getLink(name: string): Link | undefined {
    return this.#links.get(name);
  }

  getLinkOrThrow(name: string): Link {
    const result = this.getLink(name);
    assert(result);
    return result;
  }

  setLinkModel(name: string, model: Link): void {
    assert(!this.#links.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.#links.values()).includes(model));
    this.#links.set(name, model);
  }

  setLink(name: string): Link {
    const result = new Link(this);
    this.#links.set(name, result);
    return result;
  }

  deleteLink(name: string): void {
    this.#links.delete(name);
  }

  clearLinks(): void {
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

  hasCallback(name: string): boolean {
    return this.#callbacks.has(name);
  }

  getCallback(name: string): Callback | undefined {
    return this.#callbacks.get(name);
  }

  getCallbackOrThrow(name: string): Callback {
    const result = this.getCallback(name);
    assert(result);
    return result;
  }

  setCallbackModel(name: string, model: Callback): void {
    assert(!this.#callbacks.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.#callbacks.values()).includes(model));
    this.#callbacks.set(name, model);
  }

  setCallback(name: string): Callback {
    const result = new Callback(this);
    this.#callbacks.set(name, result);
    return result;
  }

  deleteCallback(name: string): void {
    this.#callbacks.delete(name);
  }

  clearCallbacks(): void {
    this.#callbacks.clear();
  }
}

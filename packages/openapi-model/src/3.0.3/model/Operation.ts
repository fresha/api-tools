import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Callback } from './Callback';
import { ExternalDocumentation } from './ExternalDocumentation';
import {
  PathParameter,
  QueryParameter,
  HeaderParameter,
  CookieParameter,
  Parameter,
} from './Parameter';
import { RequestBody } from './RequestBody';
import { Response } from './Response';
import { Responses } from './Responses';
import { SecurityRequirement } from './SecurityRequirement';
import { Server } from './Server';

import type {
  HTTPStatusCode,
  OperationModel,
  OperationModelParent,
  ParameterLocation,
  ParameterModel,
  PathItemOperationKey,
} from './types';
import type {
  CommonMarkString,
  Nullable,
  ParametrisedURLString,
  URLString,
} from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#operation-object
 */
export class Operation extends BasicNode<OperationModelParent> implements OperationModel {
  readonly #tags: string[];
  #summary: Nullable<string>;
  #description: Nullable<CommonMarkString>;
  #externalDocs: Nullable<ExternalDocumentation>;
  #operationId: Nullable<string>;
  readonly #parameters: Parameter[];
  #requestBody: Nullable<RequestBody>;
  readonly #responses: Responses;
  readonly #callbacks: Map<string, Callback>;
  #deprecated: boolean;
  security: Nullable<SecurityRequirement[]>;
  readonly #servers: Server[];

  constructor(parent: OperationModelParent) {
    super(parent);
    this.#tags = [];
    this.#summary = null;
    this.#description = null;
    this.#externalDocs = null;
    this.#operationId = null;
    this.#parameters = [];
    this.#requestBody = null;
    this.#responses = new Responses(this);
    this.#callbacks = new Map<string, Callback>();
    this.#deprecated = false;
    this.security = null;
    this.#servers = [];
  }

  get summary(): Nullable<string> {
    return this.#summary;
  }

  set summary(value: Nullable<string>) {
    this.#summary = value;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }

  get httpMethod(): PathItemOperationKey {
    return this.parent.getOperationKeyOrThrow(this);
  }

  get tagCount(): number {
    return this.#tags.length;
  }

  tags(): IterableIterator<string> {
    return this.#tags.values();
  }

  tagAt(index: number): string {
    return this.#tags[index];
  }

  hasTag(name: string): boolean {
    return this.#tags.includes(name);
  }

  addTag(name: string): void {
    assert(!this.#tags.includes(name));
    assert(this.root.hasTag(name));
    this.#tags.push(name);
  }

  deleteTag(name: string): void {
    const index = this.#tags.indexOf(name);
    if (index >= 0) {
      this.deleteTagAt(index);
    }
  }

  deleteTagAt(index: number): void {
    this.#tags.splice(index, 1);
  }

  clearTags(): void {
    this.#tags.splice(0, this.#tags.length);
  }

  get operationId(): Nullable<string> {
    return this.#operationId;
  }

  set operationId(value: Nullable<string>) {
    this.#operationId = value;
  }

  get externalDocs(): Nullable<ExternalDocumentation> {
    return this.#externalDocs;
  }

  addExternalDocs(url: URLString): ExternalDocumentation {
    assert(!this.#externalDocs, 'External documentation is already set');
    this.#externalDocs = new ExternalDocumentation(this, url);
    return this.#externalDocs;
  }

  deleteExternalDocs(): void {
    this.#externalDocs?.dispose();
    this.#externalDocs = null;
  }

  get parameterCount(): number {
    return this.#parameters.length;
  }

  parameters(): IterableIterator<Parameter> {
    return this.#parameters.values();
  }

  parameterAt(index: number): Parameter {
    return this.#parameters[index];
  }

  hasParameter(name: string, location?: ParameterLocation): boolean {
    return (
      this.#parameters.find(
        location != null
          ? param => param.name === name && param.in === location
          : param => param.name === name,
      ) != null
    );
  }

  getParameter(name: string, source: ParameterLocation): Parameter | undefined {
    return this.#parameters.find(param => param.name === name && param.in === source);
  }

  getParameterOrThrow(name: string, source: ParameterLocation): ParameterModel {
    const result = this.getParameter(name, source);
    assert(result);
    return result;
  }

  addParameter(name: string, location: 'path'): PathParameter;
  addParameter(name: string, location: 'query'): QueryParameter;
  addParameter(name: string, location: 'header'): HeaderParameter;
  addParameter(name: string, location: 'cookie'): CookieParameter;
  // eslint-disable-next-line consistent-return
  addParameter(name: string, location: ParameterLocation): ParameterModel {
    assert(this.#parameters.every(p => p.name !== name));
    switch (location) {
      case 'path': {
        const param = new PathParameter(this, name);
        this.#parameters.push(param);
        return param;
      }
      case 'query': {
        const param = new QueryParameter(this, name);
        this.#parameters.push(param);
        return param;
      }
      case 'header': {
        const param = new HeaderParameter(this, name);
        this.#parameters.push(param);
        return param;
      }
      case 'cookie': {
        const param = new CookieParameter(this, name);
        this.#parameters.push(param);
        return param;
      }
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        assert.fail(`Unexpected parameter type ${location}`);
    }
  }

  addParameterModel(param: ParameterModel): void {
    assert(
      !this.#parameters.find(p => p.name === param.name && p.in === param.in),
      `Duplicate '${param.in}' parameter named '${param.name}'`,
    );
    this.#parameters.push(param as Parameter);
  }

  deleteParameterAt(index: number): void {
    this.#parameters.splice(index);
  }

  deleteParameter(name: string): void {
    const i = this.#parameters.findIndex(p => p.name === name);
    if (i >= 0) {
      this.#parameters.splice(i, 1);
    }
  }

  clearParameters(): void {
    this.#parameters.splice(0, this.#parameters.length);
  }

  get requestBody(): Nullable<RequestBody> {
    return this.#requestBody;
  }

  setRequestBody(): RequestBody {
    assert(!this.#requestBody, 'Request body is already set');
    this.#requestBody = new RequestBody(this);
    return this.#requestBody;
  }

  setRequestBodyModel(model: RequestBody): void {
    assert(!this.#requestBody, 'Request body is already set');
    this.#requestBody = model;
  }

  deleteRequestBody(): void {
    if (this.#requestBody) {
      this.#requestBody.dispose();
      this.#requestBody = null;
    }
  }

  get responses(): Responses {
    return this.#responses;
  }

  setDefaultResponse(description: CommonMarkString): Response {
    return this.responses.setDefaultResponse(description);
  }

  deleteDefaultResponse(): void {
    this.responses.deleteDefaultResponse();
  }

  getResponse(code: HTTPStatusCode): Response | undefined {
    return this.responses.getResponse(code);
  }

  getResponseOrThrow(code: HTTPStatusCode): Response {
    return this.responses.getResponseOrThrow(code);
  }

  setResponse(code: HTTPStatusCode, description: CommonMarkString): Response {
    return this.responses.setResponse(code, description);
  }

  deleteResponse(code: HTTPStatusCode): void {
    this.responses.deleteResponse(code);
  }

  clearResponses(): void {
    this.responses.clearResponses();
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
    assert(result, `Callback named '${name}' does not exist`);
    return result;
  }

  setCallback(key: string): Callback {
    const result = new Callback(this);
    this.#callbacks.set(key, result);
    return result;
  }

  setCallbackModel(key: string, callback: Callback): void {
    assert(!this.hasCallback(key), `Callback for '${key}' name already exists`);
    assert(
      !Array.from(this.#callbacks.values()).includes(callback),
      `New callback model for key '${key}' already exists under a different key`,
    );
    this.#callbacks.set(key, callback);
  }

  deleteCallback(key: string): void {
    this.#callbacks.delete(key);
  }

  clearCallbacks(): void {
    this.#callbacks.clear();
  }

  get deprecated(): boolean {
    return this.#deprecated;
  }

  set deprecated(value: boolean) {
    this.#deprecated = value;
  }

  getSecurityRequirements(): readonly SecurityRequirement[] {
    return (
      this.security ??
      Array.from(this.root.securityRequirements() as IterableIterator<SecurityRequirement>)
    );
  }

  addSecurityRequirement(): SecurityRequirement {
    const result = new SecurityRequirement(this);
    if (!this.security) {
      this.security = [];
    }
    this.security.push(result);
    return result;
  }

  deleteSecurityRequirementAt(index: number): void {
    if (this.security) {
      this.security.splice(index, 1);
    }
  }

  clearSecurityRequirements(): void {
    if (this.security) {
      this.security.splice(0, this.security.length);
    }
  }

  setOwnSecurityRequirements(doUse: boolean): void {
    if (!doUse) {
      this.security = null;
    } else if (!this.security) {
      this.security = [];
    }
  }

  get serverCount(): number {
    return this.#servers.length;
  }

  servers(): IterableIterator<Server> {
    return this.#servers.values();
  }

  serverAt(index: number): Server {
    return this.#servers[index];
  }

  getServer(url: ParametrisedURLString): Server | undefined {
    return this.#servers.find(item => item.url === url);
  }

  getServerOrThrow(url: ParametrisedURLString): Server {
    const result = this.getServer(url);
    assert(result, `Cannot find a server with URL '${url}'`);
    return result;
  }

  addServer(url: string): Server {
    assert(this.#servers.every(s => s.url !== url));
    const result = new Server(this, url);
    this.#servers.push(result);
    return result;
  }

  deleteServer(url: string): void {
    const index = this.#servers.findIndex(server => server.url === url);
    if (index >= 0) {
      this.deleteServerAt(index);
    }
  }

  deleteServerAt(index: number): void {
    this.#servers.splice(index, 1);
  }

  clearServers(): void {
    this.#servers.splice(0, this.#servers.length);
  }
}

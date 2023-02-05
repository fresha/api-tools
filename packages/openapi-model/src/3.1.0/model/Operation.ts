import assert from 'assert';

import { Callback } from './Callback';
import { ExternalDocumentation } from './ExternalDocumentation';
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
import { Responses } from './Responses';
import { SecurityRequirement } from './SecurityRequirement';
import { Server } from './Server';
import { Tag } from './Tag';

import type { OperationModel, ParameterLocation } from './types';
import type { CommonMarkString, Nullable, URLString } from '@fresha/api-tools-core';

type OperationParent = PathItem;

export class Operation extends Node<OperationParent> implements OperationModel {
  readonly #tags: Tag[];
  #summary: Nullable<string>;
  #description: Nullable<CommonMarkString>;
  #externalDocs: Nullable<ExternalDocumentation>;
  #operationId: Nullable<string>;
  readonly #parameters: Parameter[];
  #requestBody: Nullable<RequestBody>;
  readonly #responses: Responses;
  readonly #callbacks: Map<string, Callback>;
  #deprecated: boolean;
  readonly #securityRequirements: SecurityRequirement[];
  readonly #servers: Server[];

  constructor(parent: OperationParent) {
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
    this.#securityRequirements = [];
    this.#servers = [];
  }

  get tagCount(): number {
    return this.#tags.length;
  }

  *tagNames(): IterableIterator<string> {
    for (const tag of this.#tags) {
      yield tag.name;
    }
  }

  tags(): IterableIterator<Tag> {
    return this.#tags.values();
  }

  tagAt(index: number): Tag {
    return this.#tags[index];
  }

  removeTagAt(index: number): void {
    this.#tags.splice(index, 1);
  }

  hasTag(name: string): boolean {
    return this.#tags.some(t => t.name === name);
  }

  addTag(name: string): void {
    assert(!this.hasTag(name), `Duplicate tag '${name}'`);
  }

  removeTag(name: string): void {
    const index = this.#tags.findIndex(t => t.name === name);
    if (index >= 0) {
      this.#tags.splice(index, 1);
    }
  }

  clearTags(): void {
    this.#tags.splice(0, this.#tags.length);
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

  get externalDocs(): Nullable<ExternalDocumentation> {
    return this.#externalDocs;
  }

  addExternalDocs(url: URLString): ExternalDocumentation {
    assert(!this.#externalDocs, 'External documentation already set');
    this.#externalDocs = new ExternalDocumentation(this, url);
    return this.#externalDocs;
  }

  deleteExternalDocs(): void {
    if (this.#externalDocs) {
      this.#externalDocs.dispose();
      this.#externalDocs = null;
    }
  }

  get operationId(): Nullable<string> {
    return this.#operationId;
  }

  set operationId(value: Nullable<string>) {
    if (this.#operationId !== value) {
      this.#operationId = value;
    }
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

  removeParameterAt(index: number): void {
    const parameter = this.#parameters[index];
    if (parameter) {
      this.dispose();
      this.#parameters.splice(index, 1);
    }
  }

  hasParameter(name: string, location?: ParameterLocation): boolean {
    return location
      ? this.#parameters.some(p => p.name === name && p.in === location)
      : this.#parameters.some(p => p.name === name);
  }

  getParameter(name: string, location?: ParameterLocation): Parameter {
    let result: Parameter | undefined;
    if (location) {
      result = this.#parameters.find(p => p.in === location && p.name === name);
      assert(result, `Expected to find parameter '${name}' of type '${location}'`);
    } else {
      result = this.#parameters.find(p => p.name === name);
      assert(result, `Expected to find parameter '${name}'`);
    }
    return result;
  }

  addParameter(name: string, location: 'path'): PathParameter;
  addParameter(name: string, location: 'query'): QueryParameter;
  addParameter(name: string, location: 'header'): HeaderParameter;
  addParameter(name: string, location: 'cookie'): CookieParameter;
  addParameter(name: string, location: ParameterLocation): Parameter {
    assert(
      !this.hasParameter(name, location),
      `Duplicate paramter '${name}' and type '${location}'`,
    );
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
    this.#parameters.push(result);
    return result;
  }

  removeParameter(name: string, location?: ParameterLocation): void {
    for (let i = this.#parameters.length - 1; i >= 0; i -= 1) {
      const parameter = this.#parameters[i];
      if (parameter.name === name && (!location || parameter.in === location)) {
        parameter.dispose();
        this.#parameters.splice(i, 1);
      }
    }
  }

  clearParameters(): void {
    this.#parameters.forEach(p => p.dispose());
    this.#parameters.splice(0, this.#parameters.length);
  }

  get requestBody(): Nullable<RequestBody> {
    return this.#requestBody;
  }

  addRequestBody(): RequestBody {
    assert(!this.#requestBody, 'Request body is already set');
    this.#requestBody = new RequestBody(this);
    return this.#requestBody;
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

  getCallback(key: string): Callback {
    const result = this.#callbacks.get(key);
    assert(result, `Missing callback for key '${key}'`);
    return result;
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

  get deprecated(): boolean {
    return this.#deprecated;
  }

  set deprecated(value: boolean) {
    if (this.#deprecated !== value) {
      this.#deprecated = value;
    }
  }

  get securityRequirementCount(): number {
    return this.#securityRequirements.length;
  }

  securityRequirements(): IterableIterator<SecurityRequirement> {
    return this.#securityRequirements.values();
  }

  securityRequirementAt(index: number): SecurityRequirement {
    return this.#securityRequirements[index];
  }

  addSecurityRequirement(): SecurityRequirement {
    const result = new SecurityRequirement(this);
    this.#securityRequirements.push(result);
    return result;
  }

  deleteSecurityRequirementAt(index: number): void {
    const securityRequirement = this.#securityRequirements[index];
    if (securityRequirement) {
      securityRequirement.dispose();
      this.#securityRequirements.splice(index, 1);
    }
  }

  clearSecurityRequirements(): void {
    this.#securityRequirements.forEach(sr => sr.dispose());
    this.#securityRequirements.splice(0, this.#securityRequirements.length);
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

  hasServer(url: string): boolean {
    return this.#servers.some(server => server.url === url);
  }

  addServer(url: string): Server {
    assert(!this.hasServer(url), `Server for '${url}' URL already exists`);
    const result = new Server(this, url);
    this.#servers.push(result);
    return result;
  }

  removeServerAt(index: number): void {
    const server = this.#servers[index];
    if (server) {
      server.dispose();
      this.#servers.splice(index, 1);
    }
  }

  clearServers(): void {
    this.#servers.forEach(s => s.dispose());
    this.#servers.splice(0, this.#servers.length);
  }
}

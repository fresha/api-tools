import assert from 'assert';

import { Node } from './Node';
import { Operation } from './Operation';
import {
  CookieParameter,
  HeaderParameter,
  Parameter,
  PathParameter,
  QueryParameter,
} from './Parameter';
import { Server } from './Server';

import type { Components } from './Components';
import type { OpenAPI } from './OpenAPI';
import type { Paths } from './Paths';
import type {
  OperationModel,
  ParameterLocation,
  PathItemModel,
  PathItemOperationMethod,
} from './types';
import type { CommonMarkString, Nullable } from '@fresha/api-tools-core';

type PathItemParent = OpenAPI | Components | Paths;

export class PathItem extends Node<PathItemParent> implements PathItemModel {
  #summary: Nullable<string>;
  #description: Nullable<CommonMarkString>;
  readonly #operations: Map<PathItemOperationMethod, Operation>;
  readonly #servers: Server[];
  readonly #parameters: Parameter[];

  constructor(parent: PathItemParent) {
    super(parent);
    this.#summary = null;
    this.#description = null;
    this.#operations = new Map<PathItemOperationMethod, Operation>();
    this.#servers = [];
    this.#parameters = [];
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

  get operationCount(): number {
    return this.#operations.size;
  }

  operationMethods(): IterableIterator<PathItemOperationMethod> {
    return this.#operations.keys();
  }

  operations(): IterableIterator<[PathItemOperationMethod, OperationModel]> {
    return this.#operations.entries();
  }

  hasOperation(method: PathItemOperationMethod): boolean {
    return this.#operations.has(method);
  }

  getOperation(method: PathItemOperationMethod): Operation {
    const result = this.#operations.get(method);
    assert(result, `Expect operation for method '${method}' to exist`);
    return result;
  }

  addOperation(method: PathItemOperationMethod): Operation {
    assert(!this.#operations.has(method), `Operation for method '${method}' already exists`);
    const result = new Operation(this);
    this.#operations.set(method, result);
    return result;
  }

  removeOperation(method: PathItemOperationMethod): void {
    const operation = this.#operations.get(method);
    if (operation) {
      operation.dispose();
    }
    this.#operations.delete(method);
  }

  clearOperations(): void {
    this.#operations.forEach(o => o.dispose());
    this.#operations.clear();
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

  addServer(url: string): Server {
    assert(!this.#servers.some(s => s.url === url), `Duplicate server for URL '${url}'`);
    const result = new Server(this, url);
    this.#servers.push(result);
    return result;
  }

  removeServerAt(index: number): void {
    this.#servers[index].dispose();
    this.#servers.splice(index, 1);
  }

  clearServers(): void {
    this.#servers.forEach(s => s.dispose());
    this.#servers.splice(0, this.#servers.length);
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
    this.#parameters[index].dispose();
    this.#parameters.splice(index, 1);
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
}

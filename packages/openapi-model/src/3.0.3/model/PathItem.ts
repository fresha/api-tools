import assert from 'assert';

import { BidiMap } from '../../shared/BidiMap';

import { BasicNode } from './BasicNode';
import { Operation } from './Operation';
import {
  CookieParameter,
  HeaderParameter,
  Parameter,
  PathParameter,
  QueryParameter,
} from './Parameter';
import { Server } from './Server';

import type {
  PathItemModel,
  PathItemOperationKey,
  PathItemModelParent,
  ParameterLocation,
} from './types';
import type { CommonMarkString, Nullable, ParametrisedURLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#path-item-object
 */
export class PathItem extends BasicNode<PathItemModelParent> implements PathItemModel {
  #summary: Nullable<string>;
  #description: Nullable<CommonMarkString>;
  readonly #operations: BidiMap<PathItemOperationKey, Operation>;
  readonly #servers: Server[];
  readonly #parameters: Parameter[];

  constructor(parent: PathItemModelParent) {
    super(parent);
    this.#summary = null;
    this.#description = null;
    this.#operations = new BidiMap<PathItemOperationKey, Operation>();
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

  get pathUrl(): ParametrisedURLString {
    return this.parent.getItemUrlOrThrow(this);
  }

  get operationCount(): number {
    return this.#operations.size;
  }

  operationMethods(): IterableIterator<PathItemOperationKey> {
    return this.#operations.keys();
  }

  operations(): IterableIterator<[PathItemOperationKey, Operation]> {
    return this.#operations.entries();
  }

  hasOperation(method: PathItemOperationKey): boolean {
    return this.#operations.has(method);
  }

  getOperation(key: PathItemOperationKey): Operation | undefined {
    return this.#operations.get(key);
  }

  getOperationOrThrow(key: PathItemOperationKey): Operation {
    const result = this.getOperation(key);
    assert(result, `Path item does not have '${key}' operation`);
    return result;
  }

  getOperationKey(operation: Operation): PathItemOperationKey | undefined {
    return this.#operations.getKey(operation);
  }

  getOperationKeyOrThrow(operation: Operation): PathItemOperationKey {
    const result = this.getOperationKey(operation);
    assert(result, `Operation is not associated with any key`);
    return result;
  }

  addOperation(method: PathItemOperationKey): Operation {
    assert(!this.#operations.has(method), `Duplicate ${method} operation`);
    const operation = new Operation(this);
    this.#operations.set(method, operation);
    return operation;
  }

  deleteOperation(method: PathItemOperationKey): void {
    this.#operations.delete(method);
  }

  clearOperations(): void {
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
    assert(
      !this.#servers.some(server => server.url === url),
      `Server for URL '${url}' already exists`,
    );
    const result = new Server(this, url);
    this.#servers.push(result);
    return result;
  }

  deleteServer(url: string): void {
    const index = this.#servers.findIndex(s => s.url === url);
    if (index >= 0) {
      this.deleteServerAt(index);
    }
  }

  deleteServerAt(index: number): void {
    if (index >= 0) {
      this.#servers[index].dispose();
      this.#servers.splice(index, 1);
    }
  }

  clearServers(): void {
    this.#servers.forEach(server => server.dispose());
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

  deleteParameterAt(index: number): void {
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

  addParameterModel(model: Parameter): void {
    assert(!this.#parameters.includes(model));
    this.#parameters.push(model);
  }

  deleteParameter(name: string, location?: ParameterLocation): void {
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

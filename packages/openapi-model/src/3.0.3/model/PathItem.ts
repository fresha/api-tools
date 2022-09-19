import { BasicNode } from './BasicNode';
import { Operation } from './Operation';

import type { Callback } from './Callback';
import type { Parameter } from './Parameter';
import type { Paths } from './Paths';
import type { Server } from './Server';
import type { PathItemModel, OperationModel, HTTPMethod } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export const httpMethods: HTTPMethod[] = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
];

export const whitelistedProperties = [
  ...httpMethods,
  '$ref',
  'summary',
  'description',
  'servers',
  'parameters',
];

export type PathItemParent = Paths | Callback;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#path-item-object
 */
export class PathItem extends BasicNode<PathItemParent> implements PathItemModel {
  summary: Nullable<string>;
  description: Nullable<string>;
  readonly operations2: Map<HTTPMethod, Operation>;
  servers: Server[];
  parameters: Parameter[];

  constructor(parent: PathItemParent) {
    super(parent);
    this.summary = null;
    this.description = null;
    this.operations2 = new Map<HTTPMethod, Operation>();
    this.servers = [];
    this.parameters = [];
  }

  *operations(): IterableIterator<[HTTPMethod, OperationModel]> {
    if (this.get) {
      yield ['get', this.get];
    }
    if (this.put) {
      yield ['put', this.put];
    }
    if (this.post) {
      yield ['post', this.post];
    }
    if (this.delete) {
      yield ['delete', this.delete];
    }
    if (this.options) {
      yield ['options', this.options];
    }
    if (this.head) {
      yield ['head', this.head];
    }
    if (this.patch) {
      yield ['patch', this.patch];
    }
    if (this.trace) {
      yield ['trace', this.trace];
    }
  }

  get get(): Nullable<OperationModel> {
    return this.operations2.get('get') ?? null;
  }

  get put(): Nullable<OperationModel> {
    return this.operations2.get('put') ?? null;
  }

  get post(): Nullable<OperationModel> {
    return this.operations2.get('post') ?? null;
  }

  get delete(): Nullable<OperationModel> {
    return this.operations2.get('delete') ?? null;
  }

  get options(): Nullable<OperationModel> {
    return this.operations2.get('options') ?? null;
  }

  get head(): Nullable<OperationModel> {
    return this.operations2.get('head') ?? null;
  }

  get patch(): Nullable<OperationModel> {
    return this.operations2.get('patch') ?? null;
  }

  get trace(): Nullable<OperationModel> {
    return this.operations2.get('trace') ?? null;
  }

  addOperation(method: HTTPMethod): OperationModel {
    if (this.operations2.has(method)) {
      throw new Error(`Duplicate ${method} operation`);
    }
    const operation = new Operation(this);
    this.operations2.set(method, operation);
    return operation;
  }

  removeOperation(method: HTTPMethod): void {
    this.operations2.delete(method);
  }

  clearOperations(): void {
    this.operations2.clear();
  }
}

import assert from 'assert';

import { BidiMap } from '../../BidiMap';

import { BasicNode } from './BasicNode';
import { Operation } from './Operation';
import { Server } from './Server';

import type {
  PathItemModel,
  OperationModel,
  PathItemOperationKey,
  PathItemModelParent,
  ParameterModel,
  ServerModel,
} from './types';
import type { Nullable, ParametrisedURLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#path-item-object
 */
export class PathItem extends BasicNode<PathItemModelParent> implements PathItemModel {
  summary: Nullable<string>;
  description: Nullable<string>;
  readonly operations2: BidiMap<PathItemOperationKey, OperationModel>;
  readonly servers: ServerModel[];
  readonly parameters: ParameterModel[];

  constructor(parent: PathItemModelParent) {
    super(parent);
    this.summary = null;
    this.description = null;
    this.operations2 = new BidiMap<PathItemOperationKey, OperationModel>();
    this.servers = [];
    this.parameters = [];
  }

  get pathUrl(): ParametrisedURLString {
    return this.parent.getItemUrlOrThrow(this);
  }

  getOperation(key: PathItemOperationKey): OperationModel | undefined {
    return this.operations2.get(key);
  }

  getOperationOrThrow(key: PathItemOperationKey): OperationModel {
    const result = this.getOperation(key);
    assert(result, `Path item does not have '${key}' operation`);
    return result;
  }

  getOperationKey(operation: OperationModel): PathItemOperationKey | undefined {
    return this.operations2.getKey(operation);
  }

  getOperationKeyOrThrow(operation: OperationModel): PathItemOperationKey {
    const result = this.getOperationKey(operation);
    assert(result, `Operation is not associated with any key`);
    return result;
  }

  *operations(): IterableIterator<[PathItemOperationKey, OperationModel]> {
    if (this.get) {
      yield ['get', this.get];
    }
    if (this.post) {
      yield ['post', this.post];
    }
    if (this.put) {
      yield ['put', this.put];
    }
    if (this.patch) {
      yield ['patch', this.patch];
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

  setOperation(method: PathItemOperationKey): OperationModel {
    assert(!this.operations2.has(method), `Duplicate ${method} operation`);
    const operation = new Operation(this);
    this.operations2.set(method, operation);
    return operation;
  }

  removeOperation(method: PathItemOperationKey): void {
    this.operations2.delete(method);
  }

  clearOperations(): void {
    this.operations2.clear();
  }

  addServer(url: string): ServerModel {
    const result = new Server(this, url);
    this.servers.push(result);
    return result;
  }

  deleteServer(url: string): void {
    const index = this.servers.findIndex(s => s.url === url);
    if (index >= 0) {
      this.deleteServerAt(index);
    }
  }

  deleteServerAt(index: number): void {
    if (index >= 0) {
      this.servers.splice(index, 1);
    }
  }

  clearServers(): void {
    this.servers.splice(0, this.servers.length);
  }

  addParameterModel(model: ParameterModel): void {
    assert(!this.parameters.includes(model));
    assert.equal(model.parent, this);
    this.parameters.push(model);
  }
}

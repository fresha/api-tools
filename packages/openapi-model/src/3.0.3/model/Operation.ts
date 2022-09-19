import assert from 'assert';

import { BasicNode } from './BasicNode';
import {
  PathParameter,
  QueryParameter,
  HeaderParameter,
  CookieParameter,
  Parameter,
} from './Parameter';
import { Responses } from './Responses';

import type { Callback } from './Callback';
import type { ExternalDocumentation } from './ExternalDocumentation';
import type { PathItem } from './PathItem';
import type { RequestBody } from './RequestBody';
import type { SecurityRequirement } from './SecurityRequirement';
import type { Server } from './Server';
import type { OperationModel, ParameterLocation } from './types';
import type { CommonMarkString, Nullable } from '@fresha/api-tools-core';

export type OperationParent = PathItem;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#operation-object
 */
export class Operation extends BasicNode<OperationParent> implements OperationModel {
  readonly tags: string[];
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;
  externalDocs: Nullable<ExternalDocumentation>;
  operationId: Nullable<string>;
  readonly parameters: Parameter[];
  requestBody: Nullable<RequestBody>;
  readonly responses: Responses;
  readonly callbacks: Map<string, Callback>;
  deprecated: boolean;
  security: Nullable<SecurityRequirement[]>;
  readonly servers: Server[];

  constructor(parent: OperationParent) {
    super(parent);
    this.tags = [];
    this.summary = null;
    this.description = null;
    this.externalDocs = null;
    this.operationId = null;
    this.parameters = [];
    this.requestBody = null;
    this.responses = new Responses(this);
    this.callbacks = new Map<string, Callback>();
    this.deprecated = false;
    this.security = null;
    this.servers = [];
  }

  addParameter(name: string, location: 'path'): PathParameter;
  addParameter(name: string, location: 'query'): QueryParameter;
  addParameter(name: string, location: 'header'): HeaderParameter;
  addParameter(name: string, location: 'cookie'): CookieParameter;
  // eslint-disable-next-line consistent-return
  addParameter(name: string, location: ParameterLocation): Parameter {
    switch (location) {
      case 'path': {
        const param = new PathParameter(this, name);
        this.parameters.push(param);
        return param;
      }
      case 'query': {
        const param = new QueryParameter(this, name);
        this.parameters.push(param);
        return param;
      }
      case 'header': {
        const param = new HeaderParameter(this, name);
        this.parameters.push(param);
        return param;
      }
      case 'cookie': {
        const param = new CookieParameter(this, name);
        this.parameters.push(param);
        return param;
      }
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        assert.fail(`Unexpected parameter type ${location}`);
    }
  }

  deleteParameter(name: string): void {
    const i = this.parameters.findIndex(p => p.name === name);
    if (i >= 0) {
      this.parameters.splice(i, 1);
    }
  }

  clearParameters(): void {
    this.parameters.splice(0, this.parameters.length);
  }

  addTag(name: string): void {
    if (this.tags.includes(name)) {
      throw new Error(`Duplicate tag ${name}`);
    }
    this.tags.push(name);
  }

  deleteTag(name: string): void {
    const index = this.tags.indexOf(name);
    if (index >= 0) {
      this.deleteTagAt(index);
    }
  }

  deleteTagAt(index: number): void {
    this.tags.splice(index, 1);
  }

  clearTags(): void {
    this.tags.splice(0, this.tags.length);
  }
}

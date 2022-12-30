import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Callback } from './Callback';
import { PathParameter, QueryParameter, HeaderParameter, CookieParameter } from './Parameter';
import { RequestBody } from './RequestBody';
import { Responses } from './Responses';
import { SecurityRequirement } from './SecurityRequirement';
import { Server } from './Server';

import type {
  CallbackModel,
  ExternalDocumentationModel,
  HTTPStatusCode,
  OperationModel,
  OperationModelParent,
  ParameterLocation,
  ParameterModel,
  PathItemOperationKey,
  RequestBodyModel,
  ResponseModel,
  SecurityRequirementModel,
  ServerModel,
} from './types';
import type { CommonMarkString, Nullable, ParametrisedURLString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#operation-object
 */
export class Operation extends BasicNode<OperationModelParent> implements OperationModel {
  readonly tags: string[];
  summary: Nullable<string>;
  description: Nullable<CommonMarkString>;
  externalDocumentation: Nullable<ExternalDocumentationModel>;
  operationId: Nullable<string>;
  readonly parameters: ParameterModel[];
  requestBody: Nullable<RequestBodyModel>;
  readonly responses: Responses;
  readonly callbacks: Map<string, CallbackModel>;
  deprecated: boolean;
  security: Nullable<SecurityRequirementModel[]>;
  readonly servers: ServerModel[];

  constructor(parent: OperationModelParent) {
    super(parent);
    this.tags = [];
    this.summary = null;
    this.description = null;
    this.externalDocumentation = null;
    this.operationId = null;
    this.parameters = [];
    this.requestBody = null;
    this.responses = new Responses(this);
    this.callbacks = new Map<string, CallbackModel>();
    this.deprecated = false;
    this.security = null;
    this.servers = [];
  }

  get httpMethod(): PathItemOperationKey {
    return this.parent.getOperationKeyOrThrow(this);
  }

  addTag(name: string): void {
    assert(!this.tags.includes(name));
    assert(this.root.tags.some(t => t.name === name));
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

  getParameter(name: string, source: ParameterLocation): ParameterModel | undefined {
    return this.parameters.find(param => param.name === name && param.in === source);
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
    assert(this.parameters.every(p => p.name !== name));
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

  setRequestBody(): RequestBodyModel {
    assert(!this.requestBody);
    this.requestBody = new RequestBody(this);
    return this.requestBody;
  }

  deleteRequestBody(): void {
    this.requestBody = null;
  }

  setDefaultResponse(description: CommonMarkString): ResponseModel {
    return this.responses.setDefaultResponse(description);
  }

  deleteDefaultResponse(): void {
    this.responses.deleteDefaultResponse();
  }

  getResponse(code: HTTPStatusCode): ResponseModel | undefined {
    return this.responses.getResponse(code);
  }

  getResponseOrThrow(code: HTTPStatusCode): ResponseModel {
    return this.responses.getResponseOrThrow(code);
  }

  setResponse(code: HTTPStatusCode, description: CommonMarkString): ResponseModel {
    return this.responses.setResponse(code, description);
  }

  deleteResponse(code: HTTPStatusCode): void {
    this.responses.deleteResponse(code);
  }

  clearResponses(): void {
    this.responses.clearResponses();
  }

  getCallback(name: string): CallbackModel | undefined {
    return this.callbacks.get(name);
  }

  getCallbackOrThrow(name: string): CallbackModel {
    const result = this.getCallback(name);
    assert(result);
    return result;
  }

  setCallback(key: string): CallbackModel {
    const result = new Callback(this);
    this.callbacks.set(key, result);
    return result;
  }

  deleteCallback(key: string): void {
    this.callbacks.delete(key);
  }

  clearCallbacks(): void {
    this.callbacks.clear();
  }

  getSecurityRequirements(): readonly SecurityRequirementModel[] {
    return this.security ?? this.root.security;
  }

  addSecurityRequirement(): SecurityRequirementModel {
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

  resetSecurityRequirements(): void {
    this.security = null;
  }

  getServer(url: ParametrisedURLString): ServerModel | undefined {
    return this.servers.find(item => item.url === url);
  }

  getServerOrThrow(url: ParametrisedURLString): ServerModel {
    const result = this.getServer(url);
    assert(result);
    return result;
  }

  addServer(url: string): ServerModel {
    assert(this.servers.every(s => s.url !== url));
    const result = new Server(this, url);
    this.servers.push(result);
    return result;
  }

  deleteServer(url: string): void {
    const index = this.servers.findIndex(server => server.url === url);
    if (index >= 0) {
      this.deleteServerAt(index);
    }
  }

  deleteServerAt(index: number): void {
    this.servers.splice(index, 1);
  }

  clearServers(): void {
    this.servers.splice(0, this.servers.length);
  }
}

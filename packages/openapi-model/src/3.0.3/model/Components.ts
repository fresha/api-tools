import assert from 'assert';

import { BasicNode } from './BasicNode';
import { Callback } from './Callback';
import { Example } from './Example';
import { Header } from './Header';
import { Link } from './Link';
import { CookieParameter, HeaderParameter, PathParameter, QueryParameter } from './Parameter';
import { RequestBody } from './RequestBody';
import { Response } from './Response';
import { Schema, SchemaFactory } from './Schema';
import {
  APIKeySecurityScheme,
  HTTPSecurityScheme,
  OAuth2SecurityScheme,
  OpenIdConnectSecurityScheme,
} from './SecurityScheme';

import type {
  CallbackModel,
  ComponentsModel,
  ComponentsModelParent,
  ExampleModel,
  HeaderModel,
  LinkModel,
  ParameterModel,
  RequestBodyModel,
  ResponseModel,
  SchemaCreateType,
  SchemaModel,
  SecuritySchemaModel,
} from './types';
import type { CommonMarkString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#components-object
 */
export class Components extends BasicNode<ComponentsModelParent> implements ComponentsModel {
  readonly schemas: Map<string, SchemaModel>;
  readonly responses: Map<string, ResponseModel>;
  readonly parameters: Map<string, ParameterModel>;
  readonly examples: Map<string, ExampleModel>;
  readonly requestBodies: Map<string, RequestBodyModel>;
  readonly headers: Map<string, HeaderModel>;
  readonly securitySchemes: Map<string, SecuritySchemaModel>;
  readonly links: Map<string, LinkModel>;
  readonly callbacks: Map<string, CallbackModel>;

  constructor(parent: ComponentsModelParent) {
    super(parent);
    this.schemas = new Map<string, SchemaModel>();
    this.responses = new Map<string, ResponseModel>();
    this.parameters = new Map<string, ParameterModel>();
    this.examples = new Map<string, ExampleModel>();
    this.requestBodies = new Map<string, RequestBodyModel>();
    this.headers = new Map<string, HeaderModel>();
    this.securitySchemes = new Map<string, SecuritySchemaModel>();
    this.links = new Map<string, LinkModel>();
    this.callbacks = new Map<string, CallbackModel>();
  }

  isEmpty(): boolean {
    return (
      !this.schemas.size &&
      !this.responses.size &&
      !this.parameters.size &&
      !this.examples.size &&
      !this.requestBodies.size &&
      !this.headers.size &&
      !this.securitySchemes.size &&
      !this.links.size &&
      !this.callbacks.size
    );
  }

  setSchemaModel(name: string, model: SchemaModel): void {
    assert(!this.schemas.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.schemas.values()).includes(model));
    this.schemas.set(name, model);
  }

  setSchema(name: string, type?: SchemaCreateType): SchemaModel {
    assert(!this.schemas.has(name));
    const result = SchemaFactory.create(this, type ?? null);
    this.schemas.set(name, result);
    return result;
  }

  deleteSchema(name: string): void {
    this.schemas.delete(name);
  }

  clearSchemas(): void {
    this.schemas.clear();
  }

  setResponseModel(name: string, model: ResponseModel): void {
    assert(!this.responses.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.responses.values()).includes(model));
    this.responses.set(name, model);
  }

  setResponse(name: string, description: CommonMarkString): ResponseModel {
    const result = new Response(this, description);
    this.responses.set(name, result);
    return result;
  }

  deleteResponse(name: string): void {
    this.responses.delete(name);
  }

  clearResponses(): void {
    this.responses.clear();
  }

  setParameterModel(name: string, model: ParameterModel): void {
    assert(!this.parameters.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.parameters.values()).includes(model));
    this.parameters.set(name, model);
  }

  setParameter(name: string, kind: ParameterModel['in'], paramName: string): ParameterModel {
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
    this.parameters.set(name, result);
    return result;
  }

  deleteParameter(name: string): void {
    this.parameters.delete(name);
  }

  clearParameters(): void {
    this.parameters.clear();
  }

  setExampleModel(name: string, model: ExampleModel): void {
    assert(!this.examples.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.examples.values()).includes(model));
    this.examples.set(name, model);
  }

  setExample(name: string): ExampleModel {
    const example = new Example(this);
    this.examples.set(name, example);
    return example;
  }

  deleteExample(name: string): void {
    this.examples.delete(name);
  }

  clearExamples(): void {
    this.examples.clear();
  }

  setRequestBodyModel(name: string, model: RequestBodyModel): void {
    assert(!this.requestBodies.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.requestBodies.values()).includes(model));
    this.requestBodies.set(name, model);
  }

  setRequestBody(name: string): RequestBodyModel {
    const result = new RequestBody(this);
    this.requestBodies.set(name, result);
    return result;
  }

  deleteRequestBody(name: string): void {
    this.requestBodies.delete(name);
  }

  clearRequestBodies(): void {
    this.requestBodies.clear();
  }

  setHeaderModel(name: string, model: HeaderModel): void {
    assert(!this.headers.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.headers.values()).includes(model));
    this.headers.set(name, model);
  }

  setHeader(name: string): HeaderModel {
    const result = new Header(this);
    this.headers.set(name, result);
    return result;
  }

  deleteHeader(name: string): void {
    this.headers.delete(name);
  }

  clearHeaders(): void {
    this.headers.clear();
  }

  setSecuritySchemaModel(name: string, model: SecuritySchemaModel): void {
    assert(!this.securitySchemes.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.securitySchemes.values()).includes(model));
    this.securitySchemes.set(name, model);
  }

  setSecuritySchema(name: string, kind: SecuritySchemaModel['type']): SecuritySchemaModel {
    let result: SecuritySchemaModel;
    switch (kind) {
      case 'apiKey':
        result = new APIKeySecurityScheme(this, 'x', 'header');
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
    this.securitySchemes.set(name, result);
    return result;
  }

  deleteSecuritySchema(name: string): void {
    this.securitySchemes.delete(name);
  }

  clearSecuritySchemes(): void {
    this.securitySchemes.clear();
  }

  setLinkModel(name: string, model: LinkModel): void {
    assert(!this.links.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.links.values()).includes(model));
    this.links.set(name, model);
  }

  setLink(name: string): LinkModel {
    const result = new Link(this);
    this.links.set(name, result);
    return result;
  }

  deleteLink(name: string): void {
    this.links.delete(name);
  }

  clearLinks(): void {
    this.links.clear();
  }

  setCallbackModel(name: string, model: CallbackModel): void {
    assert(!this.callbacks.has(name));
    assert.equal(model.parent, this);
    assert(!Array.from(this.callbacks.values()).includes(model));
    this.callbacks.set(name, model);
  }

  setCallback(name: string): CallbackModel {
    const result = new Callback(this);
    this.callbacks.set(name, result);
    return result;
  }

  deleteCallback(name: string): void {
    this.callbacks.delete(name);
  }

  clearCallbacks(): void {
    this.callbacks.clear();
  }
}

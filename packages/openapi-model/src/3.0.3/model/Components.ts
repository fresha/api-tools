import { BasicNode } from './BasicNode';
import { Callback } from './Callback';
import { Example } from './Example';
import { Header } from './Header';
import { Link } from './Link';
import { CookieParameter } from './Parameter/CookieParameter';
import { HeaderParameter } from './Parameter/HeaderParameter';
import { PathParameter } from './Parameter/PathParameter';
import { QueryParameter } from './Parameter/QueryParameter';
import { RequestBody } from './RequestBody';
import { Response } from './Response';
import { Schema, SchemaFactory } from './Schema';
import { ApiKeyScheme } from './SecurityScheme/ApiKeyScheme';
import { HttpScheme } from './SecurityScheme/HttpScheme';
import { OAuth2Scheme } from './SecurityScheme/OAuth2Scheme';
import { OpenIdConnectScheme } from './SecurityScheme/OpenIdConnectScheme';

import type { OpenAPI } from './OpenAPI';
import type { SecurityScheme } from './SecurityScheme';
import type {
  CallbackModel,
  ComponentsModel,
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

type AllParameters = PathParameter | QueryParameter | HeaderParameter | CookieParameter;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#components-object
 */
export class Components extends BasicNode<OpenAPI> implements ComponentsModel {
  readonly schemas: Map<string, Schema>;
  readonly responses: Map<string, Response>;
  readonly parameters: Map<string, AllParameters>;
  readonly examples: Map<string, Example>;
  readonly requestBodies: Map<string, RequestBody>;
  readonly headers: Map<string, Header>;
  readonly securitySchemas: Map<string, SecurityScheme>;
  readonly links: Map<string, Link>;
  readonly callbacks: Map<string, Callback>;

  constructor(parent: OpenAPI) {
    super(parent);
    this.schemas = new Map<string, Schema>();
    this.responses = new Map<string, Response>();
    this.parameters = new Map<string, AllParameters>();
    this.examples = new Map<string, Example>();
    this.requestBodies = new Map<string, RequestBody>();
    this.headers = new Map<string, Header>();
    this.securitySchemas = new Map<string, SecurityScheme>();
    this.links = new Map<string, Link>();
    this.callbacks = new Map<string, Callback>();
  }

  isEmpty(): boolean {
    return (
      !this.schemas.size &&
      !this.responses.size &&
      !this.parameters.size &&
      !this.examples.size &&
      !this.requestBodies.size &&
      !this.headers.size &&
      !this.securitySchemas.size &&
      !this.links.size &&
      !this.callbacks.size
    );
  }

  setSchema(name: string, type?: SchemaCreateType): SchemaModel {
    const result = SchemaFactory.create(this, type ?? null) as Schema;
    this.schemas.set(name, result);
    return result;
  }

  deleteSchema(name: string): void {
    this.schemas.delete(name);
  }

  clearSchemas(): void {
    this.schemas.clear();
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

  setSecuritySchema(name: string, kind: SecuritySchemaModel['type']): SecuritySchemaModel {
    let result: SecurityScheme;
    switch (kind) {
      case 'apiKey':
        result = new ApiKeyScheme(this, 'x', 'header');
        break;
      case 'http':
        result = new HttpScheme(this, Schema.create(this));
        break;
      case 'oauth2':
        result = new OAuth2Scheme(this);
        break;
      case 'openIdConnect':
        result = new OpenIdConnectScheme(this, 'http://www.example.com');
        break;
      default:
        throw new Error(`Unsupported security scheme type ${String(kind)}`);
    }
    this.securitySchemas.set(name, result);
    return result;
  }

  deleteSecuritySchema(name: string): void {
    this.securitySchemas.delete(name);
  }

  clearSecuritySchemas(): void {
    this.securitySchemas.clear();
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

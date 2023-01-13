import assert from 'assert';

import { Components } from './Components';
import { ExternalDocumentation } from './ExternalDocumentation';
import { Info } from './Info';

import type {
  OpenApiVersion,
  OpenAPIModel,
  ServerModel,
  PathItemModel,
  TagModel,
  SpecificationExtensionsModel,
  OpenAPIModelFactory,
  SecurityRequirementModel,
} from './types';

import { PathItem } from './PathItem';

import type {
  CommonMarkString,
  Nullable,
  VersionString,
  JSONValue,
  ParametrisedURLString,
} from '@fresha/api-tools-core';

import { Paths } from './Paths';
import { SecurityRequirement } from './SecurityRequirement';
import { Server } from './Server';
import { Tag } from './Tag';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#openapi-object
 */
export class OpenAPI implements OpenAPIModel, SpecificationExtensionsModel {
  static create(): OpenAPI;
  static create(title: string, version: string): OpenAPI;
  static create(title?: string, version?: string): OpenAPI {
    return new OpenAPI(title ?? 'New API', version ?? '0.1.0');
  }

  readonly openapi: OpenApiVersion;
  info: Info;
  readonly servers: Server[];
  readonly paths: Paths;
  readonly components: Components;
  readonly security: SecurityRequirement[];
  readonly tags: Tag[];
  externalDocs: Nullable<ExternalDocumentation>;
  readonly extensions: Map<string, JSONValue>;

  constructor(title: string, version: VersionString) {
    this.openapi = '3.0.3';
    this.info = new Info(this, title, version);
    this.servers = [];
    this.paths = new Paths(this);
    this.components = new Components(this);
    this.security = [];
    this.tags = [];
    this.externalDocs = null;
    this.extensions = new Map<string, JSONValue>();
  }

  get root(): OpenAPIModel {
    return this;
  }

  getExtension(key: string): JSONValue | undefined {
    return this.extensions.get(key);
  }

  getExtensionOrThrow(key: string): JSONValue {
    const result = this.getExtension(key);
    assert(result !== undefined);
    return result;
  }

  setExtension(key: string, value: JSONValue): void {
    this.extensions.set(key, value);
  }

  deleteExtension(key: string): void {
    this.extensions.delete(key);
  }

  clearExtensions(): void {
    this.extensions.clear();
  }

  getServer(url: ParametrisedURLString): ServerModel | undefined {
    return this.servers.find(item => item.url === url);
  }

  getServerOrThrow(url: ParametrisedURLString): ServerModel {
    const result = this.getServer(url);
    assert(result);
    return result;
  }

  addServer(
    url: ParametrisedURLString,
    variableDefaults?: Record<string, string>,
    description?: CommonMarkString,
  ): ServerModel {
    if (this.servers.find(server => server.url === url)) {
      throw new Error(`Duplicate server URL ${url}`);
    }

    const server = new Server(this, url, variableDefaults);
    if (description) {
      server.description = description;
    }
    this.servers.push(server);
    return server;
  }

  removeServerAt(index: number): void {
    this.servers.splice(index, 1);
  }

  clearServers(): void {
    this.servers.splice(0, this.servers.length);
  }

  getPathItem(url: ParametrisedURLString): PathItemModel | undefined {
    return this.paths.get(url);
  }

  getPathItemOrThrow(url: ParametrisedURLString): PathItemModel {
    const result = this.paths.get(url);
    assert(result);
    return result;
  }

  setPathItem(url: ParametrisedURLString): PathItemModel {
    if (this.paths.has(url)) {
      throw new Error(`Duplicate path item ${url}`);
    }
    const pathItem = new PathItem(this.paths);
    this.paths.set(url, pathItem);
    return pathItem;
  }

  deletePathItem(url: ParametrisedURLString): void {
    this.paths.delete(url);
  }

  clearPathItems(): void {
    this.paths.clear();
  }

  addSecurityRequirement(): SecurityRequirementModel {
    const result = new SecurityRequirement(this);
    this.security.push(result);
    return result;
  }

  deleteSecurityRequirementAt(index: number): void {
    this.security.splice(index, 1);
  }

  clearSecurityRequirements(): void {
    this.security.splice(0, this.security.length);
  }

  getTag(name: string): TagModel | undefined {
    return this.tags.find(item => item.name === name);
  }

  getTagOrThrow(name: string): TagModel {
    const result = this.getTag(name);
    assert(result);
    return result;
  }

  addTag(name: string): TagModel {
    if (this.tags.find(tag => tag.name === name)) {
      throw new Error(`Duplicate tag ${name}`);
    }
    const tag = new Tag(this, name);
    this.tags.push(tag);
    return tag;
  }

  deleteTag(name: string): void {
    const index = this.tags.findIndex(tag => tag.name === name);
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

  // eslint-disable-next-line class-methods-use-this
  dispose(): void {}
}

export const OpenAPIFactory: OpenAPIModelFactory = OpenAPI;

import assert from 'assert';

import isURL from 'validator/lib/isURL';

import { Components } from './Components';
import { ExternalDocumentation } from './ExternalDocumentation';
import { Info } from './Info';
import { PathItem } from './PathItem';
import { Paths } from './Paths';
import { SecurityRequirement } from './SecurityRequirement';
import { Server } from './Server';
import { Tag } from './Tag';

import type {
  OpenApiVersion,
  OpenAPIModel,
  SpecificationExtensionsModel,
  OpenAPIModelFactory,
} from './types';
import type {
  CommonMarkString,
  Nullable,
  VersionString,
  JSONValue,
  ParametrisedURLString,
  URLString,
} from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#openapi-object
 */
export class OpenAPI implements OpenAPIModel, SpecificationExtensionsModel {
  static create(): OpenAPI;
  static create(title: string, version: string): OpenAPI;
  static create(title?: string, version?: string): OpenAPI {
    return new OpenAPI(title ?? 'New API', version ?? '0.1.0');
  }

  readonly #info: Info;
  readonly #servers: Server[];
  readonly #paths: Paths;
  readonly #components: Components;
  readonly #securityRequirements: SecurityRequirement[];
  readonly #tags: Tag[];
  #externalDocs: Nullable<ExternalDocumentation>;
  readonly #extensions: Map<string, JSONValue>;

  constructor(title: string, version: VersionString) {
    this.#info = new Info(this, title, version);
    this.#servers = [];
    this.#paths = new Paths(this);
    this.#components = new Components(this);
    this.#securityRequirements = [];
    this.#tags = [];
    this.#externalDocs = null;
    this.#extensions = new Map<string, JSONValue>();
  }

  // eslint-disable-next-line class-methods-use-this
  get openapi(): OpenApiVersion {
    return '3.0.3';
  }

  get root(): OpenAPIModel {
    return this;
  }

  get extensionCount(): number {
    return this.#extensions.size;
  }

  extensionKeys(): IterableIterator<string> {
    return this.#extensions.keys();
  }

  extensions(): IterableIterator<[string, JSONValue]> {
    return this.#extensions.entries();
  }

  hasExtension(key: string): boolean {
    return this.#extensions.has(key);
  }

  getExtension(key: string): JSONValue | undefined {
    return this.#extensions.get(key);
  }

  getExtensionOrThrow(key: string): JSONValue {
    const result = this.getExtension(key);
    assert(result !== undefined);
    return result;
  }

  setExtension(key: string, value: JSONValue): void {
    this.#extensions.set(key, value);
  }

  deleteExtension(key: string): void {
    this.#extensions.delete(key);
  }

  clearExtensions(): void {
    this.#extensions.clear();
  }

  get info(): Info {
    return this.#info;
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

  getServer(url: ParametrisedURLString): Server | undefined {
    return this.#servers.find(item => item.url === url);
  }

  getServerOrThrow(url: ParametrisedURLString): Server {
    const result = this.getServer(url);
    assert(result);
    return result;
  }

  addServer(
    url: ParametrisedURLString,
    variableDefaults?: Record<string, string>,
    description?: CommonMarkString,
  ): Server {
    if (this.#servers.find(server => server.url === url)) {
      throw new Error(`Duplicate server URL ${url}`);
    }

    const server = new Server(this, url, variableDefaults);
    if (description) {
      server.description = description;
    }
    this.#servers.push(server);
    return server;
  }

  deleteServerAt(index: number): void {
    this.#servers[index].dispose();
    this.#servers.splice(index, 1);
  }

  clearServers(): void {
    this.#servers.forEach(server => server.dispose());
    this.#servers.splice(0, this.#servers.length);
  }

  get paths(): Paths {
    return this.#paths;
  }

  getPathItem(url: ParametrisedURLString): PathItem | undefined {
    return this.paths.get(url);
  }

  getPathItemOrThrow(url: ParametrisedURLString): PathItem {
    const result = this.paths.get(url);
    assert(result);
    return result;
  }

  setPathItem(url: ParametrisedURLString): PathItem {
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

  get components(): Components {
    return this.#components;
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
    this.#securityRequirements[index].dispose();
    this.#securityRequirements.splice(index, 1);
  }

  clearSecurityRequirements(): void {
    this.#securityRequirements.forEach(req => req.dispose());
    this.#securityRequirements.splice(0, this.#securityRequirements.length);
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

  hasTag(name: string): boolean {
    return !!this.#tags.find(tag => tag.name === name);
  }

  indexOfTag(name: string): number {
    return this.#tags.findIndex(tag => tag.name === name);
  }

  getTag(name: string): Tag | undefined {
    return this.#tags.find(item => item.name === name);
  }

  getTagOrThrow(name: string): Tag {
    const result = this.getTag(name);
    assert(result);
    return result;
  }

  addTag(name: string): Tag {
    if (this.#tags.find(tag => tag.name === name)) {
      throw new Error(`Duplicate tag ${name}`);
    }
    const tag = new Tag(this, name);
    this.#tags.push(tag);
    return tag;
  }

  deleteTag(name: string): void {
    const index = this.#tags.findIndex(tag => tag.name === name);
    if (index >= 0) {
      this.deleteTagAt(index);
    }
  }

  deleteTagAt(index: number): void {
    this.#tags[index].dispose();
    this.#tags.splice(index, 1);
  }

  clearTags(): void {
    this.#tags.forEach(tag => tag.dispose());
    this.#tags.splice(0, this.#tags.length);
  }

  // eslint-disable-next-line class-methods-use-this
  dispose(): void {}

  get externalDocs(): Nullable<ExternalDocumentation> {
    return this.#externalDocs;
  }

  setExternalDocs(url: URLString): ExternalDocumentation {
    assert(!this.#externalDocs, 'External documentation is already set');
    assert(isURL(url), `'${url}' is not a valid URL`);
    this.#externalDocs = new ExternalDocumentation(this, url);
    return this.#externalDocs;
  }

  deleteExternalDocs(): void {
    this.#externalDocs?.dispose();
    this.#externalDocs = null;
  }
}

export const OpenAPIFactory: OpenAPIModelFactory = OpenAPI;

import assert from 'assert';

import { Nullable } from '@fresha/api-tools-core';

import { Components } from './Components';
import { ExternalDocumentation } from './ExternalDocumentation';
import { Info } from './Info';
import { Node } from './Node';
import { PathItem } from './PathItem';
import { Paths } from './Paths';
import { SecurityRequirement } from './SecurityRequirement';
import { Server } from './Server';
import { Tag } from './Tag';

import type { OpenAPIModel, OpenAPIModelFactory, OpenAPIVersion } from './types';

export class OpenAPI extends Node<null> implements OpenAPIModel {
  static create(): OpenAPI;
  static create(title: string, version: string): OpenAPI;
  static create(title?: string, version?: string): OpenAPI {
    return new OpenAPI(title ?? 'New OpenAPI 3.1', version ?? '0.1.0');
  }

  readonly #info: Info;
  #jsonSchemaDialect: string;
  readonly #servers: Server[];
  readonly #paths: Paths;
  readonly #webhooks: Map<string, PathItem>;
  readonly #components: Components;
  readonly #securityRequirements: SecurityRequirement[];
  readonly #tags: Tag[];
  #externalDocs: Nullable<ExternalDocumentation>;

  constructor(title: string, version: string) {
    super(null);
    this.#info = new Info(this, title, version);
    this.#jsonSchemaDialect = '';
    this.#servers = [];
    this.#paths = new Paths(this);
    this.#webhooks = new Map<string, PathItem>();
    this.#components = new Components(this);
    this.#securityRequirements = [];
    this.#tags = [];
    this.#externalDocs = null;
  }

  get root(): OpenAPI {
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  get openapi(): OpenAPIVersion {
    return '3.1.0';
  }

  get info(): Info {
    return this.#info;
  }

  get jsonSchemaDialect(): string {
    return this.#jsonSchemaDialect;
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
    const server = new Server(this, url);
    this.#servers.push(server);
    return server;
  }

  removeServerAt(index: number): void {
    this.#servers[index].dispose();
    this.#servers.splice(index, 1);
  }

  clearServers(): void {
    this.#servers.forEach(s => s.dispose());
    this.#servers.splice(0, this.#servers.length);
  }

  get paths(): Paths {
    return this.#paths;
  }

  get webhookCount(): number {
    return this.#webhooks.size;
  }

  webhookKeys(): IterableIterator<string> {
    return this.#webhooks.keys();
  }

  webhooks(): IterableIterator<[string, PathItem]> {
    return this.#webhooks.entries();
  }

  hasWebhook(key: string): boolean {
    return this.#webhooks.has(key);
  }

  getWebhook(key: string): PathItem {
    const result = this.#webhooks.get(key);
    assert(result, `Missing webhook '${key}'`);
    return result;
  }

  addWebhook(key: string): PathItem {
    assert(!this.#webhooks.has(key), `Webhook named '${key}' already exists`);
    const result = new PathItem(this);
    this.#webhooks.set(key, result);
    return result;
  }

  removeWebhook(key: string): void {
    const webhook = this.#webhooks.get(key);
    if (webhook) {
      webhook.dispose();
      this.#webhooks.delete(key);
    }
  }

  clearWebhooks(): void {
    this.#webhooks.forEach(w => w.dispose());
    this.#webhooks.clear();
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
    const securityRequirement = this.#securityRequirements[index];
    if (securityRequirement) {
      securityRequirement.dispose();
      this.#securityRequirements.splice(index, 1);
    }
  }

  clearSecurityRequirements(): void {
    this.#securityRequirements.forEach(s => s.dispose());
    this.#securityRequirements.splice(0, this.#securityRequirements.length);
  }

  get tagCount(): number {
    return this.#tags.length;
  }

  tags(): IterableIterator<Tag> {
    return this.#tags.values();
  }

  tagAt(index: number): Tag {
    return this.#tags[index];
  }

  hasTag(name: string): boolean {
    return this.#tags.some(t => t.name === name);
  }

  addTag(name: string): Tag {
    assert(!this.hasTag(name), `Tag named '${name}' already exists`);
    const result = new Tag(this, name);
    this.#tags.push(result);
    return result;
  }

  deleteTagAt(index: number): void {
    const tag = this.#tags[index];
    if (tag) {
      tag.dispose();
      this.#tags.splice(index, 1);
    }
  }

  clearTags(): void {
    this.#tags.forEach(t => t.dispose());
    this.#tags.splice(0, this.#tags.length);
  }

  get externalDocs(): Nullable<ExternalDocumentation> {
    return this.#externalDocs;
  }

  addExternalDocs(url: string): ExternalDocumentation {
    assert(!this.#externalDocs, 'External documentation is already set');
    this.#externalDocs = new ExternalDocumentation(this, url);
    return this.#externalDocs;
  }

  deleteExternalDocs(): void {
    if (this.#externalDocs) {
      this.#externalDocs.dispose();
      this.#externalDocs = null;
    }
  }
}

export const OpenAPIFactory: OpenAPIModelFactory = OpenAPI;

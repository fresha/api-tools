import assert from 'assert';

import { SecuritySchemaBase, SecuritySchemaParent } from './SecuritySchemaBase';

import type { APIKeySecuritySchemaLocation, APIKeySecuritySchemaModel } from '../types';

export class APIKeySecuritySchema extends SecuritySchemaBase implements APIKeySecuritySchemaModel {
  #name: string;
  #in: APIKeySecuritySchemaLocation;

  constructor(parent: SecuritySchemaParent, name: string, location: APIKeySecuritySchemaLocation) {
    super(parent);
    assert(name, 'Name of an APIKey security scheme cannot be empty');
    this.#name = name;
    this.#in = location;
  }

  // eslint-disable-next-line class-methods-use-this
  get type(): 'apiKey' {
    return 'apiKey';
  }

  get name(): string {
    return this.#name;
  }

  set name(value: string) {
    assert(value, 'Name of an APIKey security scheme cannot be empty');
    this.#name = value;
  }

  get in(): APIKeySecuritySchemaLocation {
    return this.#in;
  }

  set in(value: APIKeySecuritySchemaLocation) {
    this.#in = value;
  }
}

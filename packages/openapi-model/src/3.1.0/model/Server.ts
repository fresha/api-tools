import assert from 'assert';

import { Node } from './Node';
import { OpenAPI } from './OpenAPI';
import { PathItem } from './PathItem';
import { ServerVariable } from './ServerVariable';

import type { Operation } from './Operation';
import type { ServerModel } from './types';
import type { CommonMarkString, Nullable } from '@fresha/api-tools-core';

type ServerParent = OpenAPI | PathItem | Operation;

export class Server extends Node<ServerParent> implements ServerModel {
  #url: string;
  #description: Nullable<CommonMarkString>;
  readonly #variables: Map<string, ServerVariable>;

  constructor(parent: ServerParent, url: string) {
    super(parent);
    this.#url = url;
    this.#description = null;
    this.#variables = new Map<string, ServerVariable>();
    this.#syncVariables();
  }

  get url(): string {
    return this.#url;
  }

  set url(value: string) {
    if (this.#url !== value) {
      this.#url = value;
      this.#syncVariables();
    }
  }

  #syncVariables(): void {
    const newVarNames = (this.#url.match(/\{.+?\}/g) || []).map(elem => elem.slice(1, -1));
    assert(
      newVarNames.every(s => !!s),
      `Server URL has empty variable names ${this.#url}`,
    );

    for (const [name, variable] of this.#variables) {
      if (!newVarNames.includes(name)) {
        variable.dispose();
        this.#variables.delete(name);
      }
    }
    for (const newName of newVarNames) {
      if (!this.#variables.has(newName)) {
        this.#variables.set(newName, new ServerVariable(this));
      }
    }
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }

  get variableCount(): number {
    return this.#variables.size;
  }

  variables(): IterableIterator<ServerVariable> {
    return this.#variables.values();
  }

  variableNames(): IterableIterator<string> {
    return this.#variables.keys();
  }

  hasVariable(name: string): boolean {
    return this.#variables.has(name);
  }

  getVariable(name: string): ServerVariable {
    const result = this.#variables.get(name);
    assert(result, `Cannot find variable '${name}'`);
    return result;
  }
}

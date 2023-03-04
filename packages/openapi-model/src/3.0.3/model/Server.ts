import assert from 'assert';

import { BasicNode } from './BasicNode';
import { ServerVariable } from './ServerVariable';

import type { ServerModel, ServerModelParent } from './types';
import type { CommonMarkString, Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#server-object
 */
export class Server extends BasicNode<ServerModelParent> implements ServerModel {
  #url: string;
  #description: Nullable<string>;
  readonly #variables: Map<string, ServerVariable>;

  constructor(parent: ServerModelParent, url: string, variableDefaults?: Record<string, string>) {
    super(parent);
    this.#url = url;
    this.#description = null;
    this.#variables = new Map<string, ServerVariable>();
    this.#syncVariables(url, variableDefaults);
  }

  get url(): string {
    return this.#url;
  }

  set url(value: string) {
    if (value !== this.#url) {
      assert(!!value, `'${value}' is not a valid URL`);
      this.#url = value;
      this.#syncVariables(value);
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

  variableNames(): IterableIterator<string> {
    return this.#variables.keys();
  }

  variables(): IterableIterator<[string, ServerVariable]> {
    return this.#variables.entries();
  }

  hasVariable(name: string): boolean {
    return this.#variables.has(name);
  }

  getVariable(name: string): ServerVariable | undefined {
    return this.#variables.get(name);
  }

  getVariableOrThrow(name: string): ServerVariable {
    const result = this.getVariable(name);
    assert(result, `Server variable is missing: '${name}'`);
    return result;
  }

  #syncVariables(newUrl: string, variableDefaults?: Record<string, string>): void {
    const newVarNames = (newUrl.match(/\{.+?\}/g) || []).map(elem => elem.slice(1, -1));
    assert(
      newVarNames.every(name => !!name),
      `Illegal variable name in server URL "${newUrl}"`,
    );
    for (const [name, variable] of this.#variables) {
      if (!newVarNames.includes(name)) {
        variable.dispose();
        this.#variables.delete(name);
      }
    }
    for (const newName of newVarNames) {
      if (!this.#variables.has(newName)) {
        const defaultValue = variableDefaults?.[newName] ?? '';
        this.#variables.set(newName, new ServerVariable(this, defaultValue));
      }
    }
  }
}

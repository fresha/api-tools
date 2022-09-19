import { BasicNode } from './BasicNode';
import { ServerVariable } from './ServerVariable';

import type { OpenAPI } from './OpenAPI';
import type { PathItem } from './PathItem';
import type { ServerModel } from './types';
import type { Nullable } from '@fresha/api-tools-core';

export type ServerParent = OpenAPI | PathItem;

const isValidVariableName = (str: string): boolean => !!str;

/**
 * @see http://spec.openapis.org/oas/v3.0.3#server-object
 */
export class Server extends BasicNode<ServerParent> implements ServerModel {
  private mUrl: string;
  description: Nullable<string>;
  private readonly mVariables: Map<string, ServerVariable>;

  constructor(parent: ServerParent, url: string, variableDefaults?: Record<string, string>) {
    super(parent);
    this.mUrl = url;
    this.description = null;
    this.mVariables = new Map<string, ServerVariable>();
    this.syncVariables(url);
    if (variableDefaults) {
      for (const [name, variable] of this.mVariables) {
        if (variableDefaults[name] != null) {
          variable.default = variableDefaults[name];
        }
      }
    }
  }

  get url(): string {
    return this.mUrl;
  }

  set url(newUrl: string) {
    if (newUrl !== this.mUrl) {
      this.mUrl = newUrl;
      this.syncVariables(newUrl);
    }
  }

  get variables(): ReadonlyMap<string, ServerVariable> {
    return this.mVariables;
  }

  setVariableDefault(name: string, value: string): void {
    const variable = this.mVariables.get(name);
    if (!variable) {
      throw new Error(`Unknown variable ${name}`);
    }
    variable.default = value;
  }

  private syncVariables(newUrl: string): void {
    const newVarNames = (newUrl.match(/\{.+?\}/g) || []).map(elem => elem.slice(1, -1));
    if (!newVarNames.every(isValidVariableName)) {
      throw new Error(`Illegal variable name in server URL "${newUrl}"`);
    }
    for (const [name, variable] of this.mVariables) {
      if (!newVarNames.includes(name)) {
        variable.dispose();
        this.mVariables.delete(name);
      }
    }
    for (const newName of newVarNames) {
      if (!this.mVariables.has(newName)) {
        this.mVariables.set(newName, new ServerVariable(this, ''));
      }
    }
  }
}

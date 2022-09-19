import assert from 'assert';

import { addCommonNestImports, addDecorator } from './utils';

import type { Action } from './Action';
import type { Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';
import type { MethodDeclaration } from 'ts-morph';

/**
 * Generates code for a single parameter of a controller action.
 */
export class ActionParam {
  readonly action: Action;
  readonly from: 'body' | 'path' | 'query'; // parameter source
  readonly name: string; // parameter (method argument) name
  private readonly schema: Nullable<SchemaModel>; // OpenAPI schema

  constructor(
    action: Action,
    param: {
      in: 'path' | 'query' | 'body' | 'cookie' | 'header';
      name: string;
      schema: Nullable<SchemaModel>;
    },
  ) {
    assert(param.in === 'path' || param.in === 'query' || param.in === 'body');

    this.action = action;
    this.from = param.in;
    this.name = param.name;
    this.schema = param.schema;
  }

  generateCode(methodDecl: MethodDeclaration): void {
    const sourceFile = methodDecl.getSourceFile();

    let decoratorName = '';
    switch (this.from) {
      case 'body':
        decoratorName = 'Body';
        break;
      case 'path':
        decoratorName = 'Param';
        break;
      case 'query':
        decoratorName = 'Query';
        break;
      default:
        assert.fail(`Unsupported parameter source ${String(this.from)}`);
    }

    addCommonNestImports(sourceFile, decoratorName);
    const actionParam = methodDecl.addParameter({
      name: this.name,
      type: 'string' ?? this.schema,
    });

    switch (this.from) {
      case 'body':
        addDecorator(actionParam, 'Body', this.name);
        break;
      default:
        addDecorator(actionParam, 'Param', this.name);
        break;
    }
  }
}

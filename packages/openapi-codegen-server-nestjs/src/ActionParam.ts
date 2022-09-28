import assert from 'assert';

import { addCommonNestImports, addDecorator, addNamedImport } from './utils';

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

    let paramType = 'string';
    let validatorName: string | undefined;

    if (this.schema) {
      switch (this.schema?.type) {
        case null:
          break;
        case 'boolean':
          paramType = 'boolean';
          validatorName = 'ParseBoolPipe';
          break;
        case 'integer':
          paramType = 'number';
          validatorName = 'ParseIntPipe';
          break;
        case 'number':
          paramType = 'number';
          validatorName = 'ParseFloatPipe';
          break;
        default:
          assert.fail(`Unsupported schema type ${this.schema.type}`);
      }
    }

    if (validatorName) {
      addNamedImport(methodDecl.getSourceFile(), '@nestjs/common', validatorName);
    }

    const actionParam = methodDecl.addParameter({
      name: this.name,
      type: paramType,
    });

    switch (this.from) {
      case 'body':
        addDecorator(actionParam, 'Body', this.name);
        break;
      default: {
        const decorator = addDecorator(actionParam, 'Param', this.name);
        if (validatorName) {
          decorator.addArgument(validatorName);
        }
        break;
      }
    }
  }
}

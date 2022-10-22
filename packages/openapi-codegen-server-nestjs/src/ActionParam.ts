import assert from 'assert';

import { addDecorator, addImportDeclaration, Logger } from '@fresha/openapi-codegen-utils';

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
  protected readonly logger: Logger;

  constructor(
    action: Action,
    param: {
      in: 'path' | 'query' | 'body' | 'cookie' | 'header';
      name: string;
      schema: Nullable<SchemaModel>;
    },
    logger: Logger,
  ) {
    assert(param.in === 'path' || param.in === 'query' || param.in === 'body');

    this.action = action;
    this.from = param.in;
    this.name = param.name;
    this.schema = param.schema;
    this.logger = logger;
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

    addImportDeclaration(sourceFile, '@nestjs/common', decoratorName);

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
        case 'string':
          break;
        default:
          if (this.from !== 'body') {
            assert.fail(`Unsupported schema type ${this.schema.type}`);
          }
      }
    }

    if (validatorName) {
      addImportDeclaration(methodDecl.getSourceFile(), '@nestjs/common', validatorName);
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

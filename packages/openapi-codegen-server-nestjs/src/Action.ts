import assert from 'assert';

import { Nullable, camelCase, titleCase } from '@fresha/api-tools-core';
import { addImportDeclarations, addImportDeclaration, addDecorator } from '@fresha/code-morph-ts';
import {
  getOperationRequestBodySchema,
  getOperationDefaultResponseSchema,
} from '@fresha/openapi-codegen-utils';
import { ClassDeclaration, Scope } from 'ts-morph';

import type { Context } from './context';
import type { Controller } from './Controller';
import type { OperationModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

import { ActionParam } from './ActionParam';

/**
 * Generates code for a single NestJS controller action.
 */
export class Action {
  readonly context: Context;
  readonly controller: Controller;
  readonly pathUrl: string;
  readonly httpMethod: string;
  private readonly methodName: string;
  private readonly params: ActionParam[];
  private readonly returnSchema: Nullable<SchemaModel>; // OpenAPI schema
  private urlSuffix: string | null;

  constructor(
    context: Context,
    controller: Controller,
    pathUrl: string,
    httpMethod: string,
    operation: OperationModel,
  ) {
    this.context = context;
    this.controller = controller;
    this.pathUrl = pathUrl;
    this.httpMethod = httpMethod;
    this.methodName = operation.operationId ?? pathUrl;
    this.params = Array.from(operation.parameters, param => new ActionParam(this.context, param));

    if (operation.requestBody) {
      this.params.push(
        new ActionParam(this.context, {
          in: 'body',
          name: 'body',
          schema: getOperationRequestBodySchema(operation, this.context.useJsonApi),
        }),
      );
    }

    this.returnSchema = getOperationDefaultResponseSchema(operation, this.context.useJsonApi);
    this.urlSuffix = null;
  }

  getUrlSuffix(): string {
    if (this.urlSuffix == null) {
      const parts = this.pathUrl.split('/').map(part => {
        const norm = part.replace(/\{\w+\}/g, m => `:${m.slice(1, -1)}`);
        return norm;
      });
      let norm = parts.join('/');
      if (norm.startsWith('/:')) {
        norm = norm.slice(1);
      }
      this.urlSuffix = norm.slice(this.controller.getUrlPrefix().length);
    }
    return this.urlSuffix;
  }

  generateCode(classDecl: ClassDeclaration): void {
    this.context.logger.info(`Generating code for action ${this.methodName}`);

    addImportDeclarations(classDecl.getSourceFile(), {
      '@nestjs/common': [titleCase(this.httpMethod), 'HttpException'],
      '@fresha/json-api': 'JSONAPI',
    });

    const returnTypeName = titleCase(`${this.methodName}Response`);

    const dto = this.context.addDTO(returnTypeName, this.returnSchema);
    addImportDeclaration(
      classDecl.getSourceFile(),
      this.controller.relativeModulePath(dto.outputPath),
      returnTypeName,
    );

    this.generatePublicMethod(classDecl);
    this.generateHandlerMethod(classDecl);
  }

  private generatePublicMethod(classDecl: ClassDeclaration): void {
    const methodDecoratorName = titleCase(this.httpMethod);
    const returnTypeName = titleCase(`${this.methodName}Response`);
    const handleActionName = camelCase(`handle-${this.methodName}`);
    const responseDtoName = 'Response';

    const actionFunc = classDecl.addMethod({
      name: this.methodName,
      isAsync: true,
      returnType: `Promise<${returnTypeName}>`,
    });
    addDecorator(actionFunc, methodDecoratorName, this.getUrlSuffix() || undefined);

    for (const param of this.params) {
      param.generateCode(actionFunc);
    }

    const usedParamNames = this.params.filter(p => p.from !== 'body').map(p => p.name);

    switch (this.httpMethod) {
      case 'get':
        actionFunc.addStatements(`
          try {
            const result = await this.${handleActionName}(${usedParamNames.join(', ')});
            return JSONAPI.stringify(result, ${responseDtoName});
          } catch (err) {
            if (err instanceof JSONAPI.Exception) {
              throw JSONAPI.throwHttpException(err);
            } else if (!(err instanceof HttpException)) {
              throw new HttpException(String(err), 500);
            } else {
              throw err;
            }
          }
        `);
        break;

      case 'post':
      case 'put':
      case 'patch':
        actionFunc.addStatements(`
          try {
            const params = JSONAPI.parse(body);
            const result = await this.${handleActionName}(${usedParamNames.join(', ')}${
          usedParamNames.length ? ', ' : ''
        }params);
            return JSONAPI.stringify(result, ${responseDtoName});
          } catch (err) {
            if (err instanceof JSONAPI.Exception) {
              throw JSONAPI.throwHttpException(err);
            } else if (!(err instanceof HttpException)) {
              throw new HttpException(String(err), 500);
            } else {
              throw err;
            }
          }
        `);
        break;

      case 'delete':
        actionFunc.addStatements(`
          try {
            const result = await this.${handleActionName}(${usedParamNames.join(', ')}${
          usedParamNames.length ? ', ' : ''
        });
            return JSONAPI.stringify(result, ${responseDtoName});
          } catch (err) {
            if (err instanceof JSONAPI.Exception) {
              throw JSONAPI.throwHttpException(err);
            } else if (!(err instanceof HttpException)) {
              throw new HttpException(String(err), 500);
            } else {
              throw err;
            }
          }
        `);
        break;

      default:
        assert.fail(`Unsupported method ${this.httpMethod}`);
    }
  }

  private generateHandlerMethod(classDecl: ClassDeclaration): void {
    const handlerFunc = classDecl.addMethod({
      name: camelCase(`handle-${this.methodName}`),
      returnType: `Promise<${titleCase(`${this.methodName}Response`)}>`,
      isAsync: true,
      scope: Scope.Private,
    });

    for (const param of this.params) {
      handlerFunc.addParameter({
        name: param.name,
        type: 'string',
      });
    }

    handlerFunc.addStatements(`
      return 1;
    `);
  }
}

import assert from 'assert';
import path from 'path';

import { titleCase } from '@fresha/api-tools-core';
import {
  addTypeLiteralProperty,
  getOperationIdOrThrow,
  addTypeLiteralAlias,
  addImportDeclaration,
  addVariable,
  addFunction,
  addTypeAlias,
  getOperationRequestBodySchema,
  getOperationDefaultResponseSchema,
  Generator as GeneratorBase,
  TSProjectContext as Context,
  getMediaType,
  getOperations,
} from '@fresha/openapi-codegen-utils';

import type { OperationModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';
import type { CodeBlockWriter, SourceFile } from 'ts-morph';

type APICall = {
  operation: OperationModel;
  name: string;
  url: string;
  requestTypeName: string | null;
  requestSchema: SchemaModel | null;
  responseTypeName: string;
  responseSchema: SchemaModel | null;
};

export class Generator extends GeneratorBase<Context> {
  protected readonly sourceFile: SourceFile;
  protected readonly apiCalls: APICall[];

  constructor(context: Context) {
    super(context);
    this.sourceFile = this.context.project.createSourceFile(
      path.join(this.context.outputPath, 'src', 'index.ts'),
      '',
      { overwrite: true },
    );
    this.apiCalls = [];
  }

  protected collectData(): void {
    for (const operation of getOperations(this.context.openapi)) {
      const name = getOperationIdOrThrow(operation);
      const requestBodySchema = getOperationRequestBodySchema(operation, this.context.useJsonApi);
      const responseSchema = getOperationDefaultResponseSchema(operation, this.context.useJsonApi);

      this.apiCalls.push({
        operation,
        name,
        url: operation.parent.pathUrl,
        requestSchema: requestBodySchema,
        requestTypeName: requestBodySchema ? titleCase(`${name}Request`) : null,
        responseSchema,
        responseTypeName: titleCase(`${name}Response`),
      });
    }
  }

  protected generateCode(): void {
    addImportDeclaration(this.sourceFile, 'assert', '.:assert');

    this.sourceFile.addClass({
      name: 'APIError',
      extends: 'Error',
    });

    addVariable(this.sourceFile, 'rootUrl', "''");

    this.generateInitFunction();
    for (const call of this.apiCalls) {
      this.generateApiCall(call);
    }

    if (!this.context.dryRun) {
      this.context.project.saveSync();
    }
  }

  protected generateInitFunction(): void {
    const initParamsType = addTypeLiteralAlias(this.sourceFile, 'InitParams', true);
    addTypeLiteralProperty(initParamsType, 'rootUrl', 'string');

    const initFunc = addFunction(this.sourceFile, 'init', { params: 'InitParams' }, 'void', true);
    initFunc.addStatements((writer: CodeBlockWriter) => {
      writer.writeLine("assert(params.rootUrl, 'Expected rootUrl to be a non-empty string');");
      writer.writeLine('rootUrl = params.rootUrl;');
    });
  }

  protected generateApiCall(call: APICall): void {
    this.context.console.info(`Generating code for ${call.name}`);

    if (this.context.useJsonApi) {
      addImportDeclaration(this.sourceFile, '@fresha/noname-core', 't:JSONAPIDocument');
      if (call.requestTypeName) {
        addTypeAlias(this.sourceFile, call.requestTypeName, 'JSONAPIDocument', true);
      }
      addTypeAlias(this.sourceFile, call.responseTypeName, 'JSONAPIDocument', true);
    } else {
      if (call.requestTypeName) {
        addImportDeclaration(this.sourceFile, '@fresha/noname-core', 'JSONObject');
        addTypeAlias(this.sourceFile, call.requestTypeName, 'JSONObject', true);
      }
      addImportDeclaration(this.sourceFile, '@fresha/noname-core', 'JSONValue');
      addTypeAlias(this.sourceFile, call.responseTypeName, 'JSONValue', true);
    }

    const params: Record<string, string> = {};
    if (call.requestTypeName) {
      params.body = call.requestTypeName;
    }
    for (const param of call.operation.parameters) {
      if (param.name !== 'id' || param.in !== 'query') {
        let paramType = 'JSONValue';

        switch (param.schema?.type) {
          case null:
            break;
          case 'boolean':
            paramType = 'boolean';
            break;
          case 'number':
          case 'integer':
            paramType = 'number';
            break;
          case 'string':
            paramType = 'string';
            break;
          case 'object':
            addImportDeclaration(this.sourceFile, '@fresha/noname-core', 'JSONObject');
            paramType = 'JSONObject';
            break;
          case 'array':
            addImportDeclaration(this.sourceFile, '@fresha/noname-core', 'JSONArray');
            paramType = 'JSONArray';
            break;
          default:
            assert.fail(
              `Unsupported schema type ${String(param.schema?.type)} for parameter "${param.name}:${
                param.in
              }"`,
            );
        }

        params[param.name] = paramType;
      }
    }

    const actionFunc = addFunction(
      this.sourceFile,
      call.name,
      params,
      `Promise<${call.responseTypeName}>`,
      true,
    );
    actionFunc.setIsAsync(true);
    actionFunc.addStatements((writer: CodeBlockWriter) => {
      writer.writeLine(`const url = new URL(\`$\{rootUrl}${call.url}\`, rootUrl);`);
      for (const param of call.operation.parameters) {
        if (param.in === 'query') {
          writer.writeLine(`url.searchParams.set('${param.name}', ${param.name});`);
        }
      }

      writer.writeLine('const request = {');
      writer.indent(() => {
        if (call.requestTypeName) {
          writer.writeLine('body: JSON.stringify(body),');
        }
        writer.writeLine('headers: {');
        writer.indent(() => {
          writer.writeLine("'X-Requested-With': 'XMLHttpRequest',");
          const mediaType = getMediaType(this.context.useJsonApi);
          writer.writeLine(`Accept: '${mediaType}'`);
          writer.writeLine(`'Content-Type': '${mediaType}'`);
        });
        writer.writeLine('},');
      });
      writer.writeLine('};');
      writer.writeLine(`const response = await fetch(url, request);`);
      writer.writeLine('if (!response.ok)');
      writer.block(() => {
        writer.writeLine('throw new APIError();');
      });
      writer.writeLine('const responseJson = await response.json();');
      writer.writeLine(`const responseData = responseJson as ${call.responseTypeName};`);
      writer.writeLine('return responseData;');
    });
  }
}

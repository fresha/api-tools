import assert from 'assert';
import path from 'path';

import {
  addTypeLiteralProperty,
  Logger,
  titleCase,
  getOperationIdOrThrow,
  addTypeLiteralAlias,
  addImportDeclaration,
  addVariable,
  addFunction,
  addTypeAlias,
  getOperationRequestBodySchema,
  getOperationDefaultResponseSchema,
} from '@fresha/openapi-codegen-utils';

import type { OpenAPIModel, OperationModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';
import type { CodeBlockWriter, Project, SourceFile } from 'ts-morph';

type GeneratorOptions = {
  outputPath: string;
  useJsonApi: boolean;
  logger: Logger;
  dryRun: boolean;
};

type APICall = {
  operation: OperationModel;
  name: string;
  url: string;
  requestTypeName: string | null;
  requestSchema: SchemaModel | null;
  responseTypeName: string;
  responseSchema: SchemaModel | null;
};

export class Generator {
  readonly openapi: OpenAPIModel;
  readonly options: GeneratorOptions;
  readonly logger: Logger;
  protected readonly tsProject: Project;
  protected readonly tsSourceFile: SourceFile;
  protected readonly apiCalls: APICall[];

  constructor(openapi: OpenAPIModel, tsProject: Project, options: GeneratorOptions) {
    this.openapi = openapi;
    this.options = options;
    this.logger = options.logger;
    this.tsProject = tsProject;
    this.tsSourceFile = this.tsProject.createSourceFile(
      path.join(this.options.outputPath, 'src', 'index.ts'),
      '',
      { overwrite: true },
    );
    this.apiCalls = [];
  }

  collectData(): void {
    for (const [pathUrl, pathItem] of this.openapi.paths) {
      for (const [, operation] of pathItem.operations()) {
        const name = getOperationIdOrThrow(operation);
        const requestBodySchema = getOperationRequestBodySchema(operation, this.options.useJsonApi);
        const responseSchema = getOperationDefaultResponseSchema(
          operation,
          this.options.useJsonApi,
        );

        this.apiCalls.push({
          operation,
          name,
          url: pathUrl,
          requestSchema: requestBodySchema,
          requestTypeName: requestBodySchema ? titleCase(`${name}Request`) : null,
          responseSchema,
          responseTypeName: titleCase(`${name}Response`),
        });
      }
    }
  }

  generateCode(): void {
    this.logger.info('Generating preamble code');

    addImportDeclaration(this.tsSourceFile, 'assert', '.:assert');

    this.tsSourceFile.addClass({
      name: 'APIError',
      extends: 'Error',
    });

    addVariable(this.tsSourceFile, 'rootUrl', "''");

    this.generateInitFunction();
    for (const call of this.apiCalls) {
      this.generateApiCall(call);
    }

    if (!this.options.dryRun) {
      this.tsProject.saveSync();
    }
  }

  protected generateInitFunction(): void {
    const initParamsType = addTypeLiteralAlias(this.tsSourceFile, 'InitParams', true);
    addTypeLiteralProperty(initParamsType, 'rootUrl', 'string');

    const initFunc = addFunction(this.tsSourceFile, 'init', { params: 'InitParams' }, 'void', true);
    initFunc.addStatements((writer: CodeBlockWriter) => {
      writer.writeLine("assert(params.rootUrl, 'Expected rootUrl to be a non-empty string');");
      writer.writeLine('rootUrl = params.rootUrl;');
    });
  }

  protected generateApiCall(call: APICall): void {
    this.logger.info(`Generating code for ${call.name}`);

    if (this.options.useJsonApi) {
      addImportDeclaration(this.tsSourceFile, '@fresha/noname-core', 't:JSONAPIDocument');
      if (call.requestTypeName) {
        addTypeAlias(this.tsSourceFile, call.requestTypeName, 'JSONAPIDocument', true);
      }
      addTypeAlias(this.tsSourceFile, call.responseTypeName, 'JSONAPIDocument', true);
    } else {
      if (call.requestTypeName) {
        addImportDeclaration(this.tsSourceFile, '@fresha/noname-core', 'JSONObject');
        addTypeAlias(this.tsSourceFile, call.requestTypeName, 'JSONObject', true);
      }
      addImportDeclaration(this.tsSourceFile, '@fresha/noname-core', 'JSONValue');
      addTypeAlias(this.tsSourceFile, call.responseTypeName, 'JSONValue', true);
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
            addImportDeclaration(this.tsSourceFile, '@fresha/noname-core', 'JSONObject');
            paramType = 'JSONObject';
            break;
          case 'array':
            addImportDeclaration(this.tsSourceFile, '@fresha/noname-core', 'JSONArray');
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
      this.tsSourceFile,
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
          if (this.options.useJsonApi) {
            writer.writeLine("'Accept': 'application/vnd.api+json',");
          }
          writer.writeLine(
            this.options.useJsonApi
              ? "'Content-Type': 'application/vnd.api+json'"
              : "'Content-Type': 'application/json'",
          );
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

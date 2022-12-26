import { camelCase, Nullable, titleCase } from '@fresha/api-tools-core';
import { addFunction, addImportDeclaration, addImportDeclarations } from '@fresha/code-morph-ts';
import {
  assert,
  getOperationIdOrThrow,
  getOperationRequestBodySchema,
  getOperationParameters,
  getOperationResponseSchemas,
} from '@fresha/openapi-codegen-utils';

import { DocumentType } from './DocumentType';
import { schemaToType } from './utils';

import type { ActionContext } from '../context';
import type { NamedType } from './NamedType';
import type { ParameterModel } from '@fresha/openapi-model/build/3.0.3';
import type { CodeBlockWriter } from 'ts-morph';

type ParameterInfo = {
  parameter: ParameterModel;
  typeString: string;
};

type VariableName = string; // used to indicate strings that are variable names
type HeaderName = string;

export class ActionFunc {
  readonly context: ActionContext;
  readonly name: string;
  protected readonly parameterVars: Map<VariableName, ParameterInfo>;
  protected readonly pathParametesVars: Map<string, VariableName>;
  protected readonly headerToSet: Map<HeaderName, VariableName>;
  protected requestType: Nullable<NamedType>;
  protected responseType: Nullable<NamedType>;
  // FIXME handle other authorization schemes
  protected usesAuthCookie: boolean;

  constructor(context: ActionContext) {
    this.context = context;
    this.name = getOperationIdOrThrow(this.context.operation);
    this.parameterVars = new Map<string, ParameterInfo>();
    this.pathParametesVars = new Map<string, string>();
    this.headerToSet = new Map<HeaderName, VariableName>();
    this.requestType = null;
    this.responseType = null;
    this.usesAuthCookie = false;
  }

  collectData(namedTypes: Map<string, NamedType>): void {
    this.context.logger.info(`Collecting data for action ${this.name}`);
    this.collectParameters();
    this.collectRequestData(namedTypes);
    this.collectResponseData(namedTypes);
    this.collectAuthData();
  }

  protected collectParameters(): void {
    for (const parameter of getOperationParameters(this.context.operation)) {
      const paramName = camelCase(parameter.name);
      const typeString = schemaToType(parameter.schema);

      this.parameterVars.set(paramName, {
        typeString,
        parameter,
      });

      if (parameter.in === 'path') {
        this.pathParametesVars.set(parameter.name, paramName);
      }
      if (parameter.in === 'header') {
        this.headerToSet.set(parameter.name, paramName);
      }
    }
  }

  protected collectRequestData(namedTypes: Map<string, NamedType>): void {
    const requestSchema = getOperationRequestBodySchema(
      this.context.operation,
      this.context.useJsonApi,
    );
    if (requestSchema) {
      const requestTypeName = titleCase(`${this.name}Request`);
      assert(
        !namedTypes.has(requestTypeName),
        `Name collision for request type ${requestTypeName}`,
        this.context.operation,
      );
      this.requestType = new DocumentType(this.context, requestTypeName, requestSchema, true);
      this.requestType.collectData(namedTypes);
      namedTypes.set(requestTypeName, this.requestType);
    }
  }

  protected collectResponseData(namedTypes: Map<string, NamedType>): void {
    const responseSchemas = getOperationResponseSchemas(
      this.context.operation,
      this.context.useJsonApi,
    );
    if (responseSchemas.length) {
      const responseTypeName = titleCase(`${this.name}Response`);
      assert(
        !namedTypes.has(responseTypeName),
        `Name collision for request type ${responseTypeName}`,
        this.context.operation,
      );
      // FIXME pass all schemas, not just the first one
      this.responseType = new DocumentType(
        this.context,
        responseTypeName,
        responseSchemas[0],
        false,
      );
      this.responseType.collectData(namedTypes);
      namedTypes.set(responseTypeName, this.responseType);
    }
  }

  protected collectAuthData(): void {
    this.usesAuthCookie = !!this.context.operation.getSecurityRequirements().length;
  }

  generateCode(generatedTypes: Set<string>): void {
    this.context.logger.info(`Generating code for action ${this.name}`);

    addImportDeclarations(this.context.sourceFile, {
      './utils': ['COMMON_HEADERS', 'authorizeRequest', 'makeUrl', 'makeCall', 'toString'],
    });

    if (this.requestType) {
      this.requestType.generateCode(generatedTypes);
    }
    if (this.responseType) {
      this.responseType.generateCode(generatedTypes);
    }

    const actionFunc = addFunction(
      this.context.sourceFile,
      this.name,
      this.generateParameters(),
      `Promise<${this.responseType ? this.responseType?.name : 'void'}>`,
      true,
    );
    actionFunc.setIsAsync(true);
    actionFunc.addStatements((writer: CodeBlockWriter) => {
      writer.writeLine(`const url = makeUrl(${this.generateCallUrl()});`);

      for (const [paramName, paramInfo] of this.parameterVars) {
        if (paramInfo.parameter.in === 'query') {
          writer.writeLine(
            `url.searchParams.set('${paramInfo.parameter.name}', toString(${paramName}));`,
          );
        }
      }
      writer.newLine();

      writer.writeLine('const request = {');
      writer.indent(() => {
        const httpMethod = this.context.operation.httpMethod.toLowerCase();
        if (httpMethod !== 'get') {
          writer.writeLine(`method: '${httpMethod}',`);
        }
        if (this.requestType) {
          writer.writeLine('body: JSON.stringify(body),');
        }
        if (this.headerToSet.size) {
          writer.write('headers:');
          writer.block(() => {
            writer.writeLine('...COMMON_HEADERS,');
            for (const [headerName, varName] of this.headerToSet) {
              writer.writeLine(`'${headerName}': ${varName}`);
            }
          });
          writer.writeLine(',');
        } else {
          writer.writeLine('headers: COMMON_HEADERS,');
        }
      });
      writer.writeLine('};');
      writer.newLine();

      if (this.usesAuthCookie) {
        writer.writeLine('authorizeRequest(request);');
        writer.newLine();
      }

      writer.writeLine(`const response = await makeCall(url, request);`);
      writer.newLine();

      if (this.responseType) {
        writer.writeLine(`return response as ${this.responseType.name};`);
      } else {
        writer.writeLine(`return`);
      }
    });
  }

  protected generateParameters(): Record<string, string> {
    const params: Record<string, string> = {};
    if (this.requestType) {
      params.body = this.requestType.name;
    }

    for (const [paramName, paramInfo] of this.parameterVars) {
      if (paramInfo.typeString === 'JSONObject') {
        addImportDeclaration(this.context.sourceFile, '@fresha/api-tools-core', 't:JSONObject');
      } else if (paramInfo.typeString === 'JSONArray') {
        addImportDeclaration(this.context.sourceFile, '@fresha/api-tools-core', 't:JSONArray');
      }
      params[paramName] = paramInfo.typeString;
    }

    return params;
  }

  protected generateCallUrl(): string {
    const { pathUrl } = this.context.operation.parent;
    const str = pathUrl.replace(/\{\w+\}/g, match => {
      const argName = this.pathParametesVars.get(match.slice(1, -1));
      assert(
        argName,
        `Found '${match}' parameter in '${pathUrl}', but not path parameter`,
        this.context.operation,
      );
      return `\${${argName}}`;
    });

    return `\`${str}\``;
  }
}
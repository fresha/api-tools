import { camelCase, Nullable, titleCase } from '@fresha/api-tools-core';
import { addFunction, addImportDeclaration, addImportDeclarations } from '@fresha/code-morph-ts';
import {
  assert,
  getOperationIdOrThrow,
  getOperationRequestBodySchema,
  getOperationParameters,
  getOperationResponseSchemas,
  getCodegenOptions,
} from '@fresha/openapi-codegen-utils';
import { CodeBlockWriter, SyntaxKind } from 'ts-morph';

import { DocumentType } from './DocumentType';
import { schemaToType } from './utils';

import type { NamedType } from './NamedType';
import type { ActionContext } from '../context';
import type { ParameterModel } from '@fresha/openapi-model/build/3.0.3';
import type { FunctionDeclaration } from 'ts-morph';

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
  protected parsesResponse: boolean;
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
    this.parsesResponse = true;
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
      this.requestType = new DocumentType(
        this.context,
        requestTypeName,
        requestSchema,
        true,
        !!this.context.operation.requestBody?.required,
      );
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
        true,
      );
      this.responseType.collectData(namedTypes);
      namedTypes.set(responseTypeName, this.responseType);
    }

    const opts = getCodegenOptions(this.context.operation, 'client-fetch');
    if (opts != null) {
      this.parsesResponse = opts.return !== 'response';
    }
  }

  protected collectAuthData(): void {
    this.usesAuthCookie = !!this.context.operation.getSecurityRequirements().length;
  }

  generateCode(): void {
    this.context.logger.info(`Generating code for action ${this.name}`);

    addImportDeclarations(this.context.sourceFile, {
      './utils': ['COMMON_HEADERS', 'makeUrl', this.parsesResponse ? 'callJsonApi' : 'callApi'],
    });

    if (this.parameterVars.size) {
      addImportDeclaration(this.context.sourceFile, './utils', 'addQueryParam');
    }

    if (this.usesAuthCookie) {
      addImportDeclaration(this.context.sourceFile, './utils', 'authorizeRequest');
    }

    if (this.requestType) {
      addImportDeclaration(this.context.sourceFile, './types', `t:${this.requestType.name}`);
    }
    if (this.responseType) {
      addImportDeclaration(this.context.sourceFile, './types', `t:${this.responseType.name}`);
    }

    let resultType = 'void';
    if (!this.parsesResponse) {
      resultType = 'Response';
    } else if (this.responseType) {
      resultType = this.responseType?.name;
    }

    addImportDeclarations(this.context.sourceFile, {
      './utils': ['t:ExtraCallParams', 'applyExtraParams'],
    });

    const actionFuncHasParams = !!(this.parameterVars.size || this.requestType);
    const actionFunc = addFunction(
      this.context.sourceFile,
      this.name,
      actionFuncHasParams
        ? { params: '{}', extraParams: 'ExtraCallParams' }
        : { extraParams: 'ExtraCallParams' },
      `Promise<${resultType}>`,
      true,
    );
    actionFunc.setIsAsync(true);

    this.generateJsDocs(actionFunc, actionFuncHasParams);
    this.generateParameters(actionFunc);

    actionFunc.addStatements((writer: CodeBlockWriter) => {
      writer.writeLine(`const url = makeUrl(${this.generateCallUrl()});`);

      for (const [paramName, paramInfo] of this.parameterVars) {
        if (paramInfo.parameter.in === 'query') {
          writer.writeLine(
            `addQueryParam(url, '${paramInfo.parameter.name}', params.${paramName});`,
          );
        }
      }
      writer.newLine();

      if (this.requestType) {
        if (this.context.apiNaming) {
          const transformFunc = `${this.context.apiNaming}CaseDeep`;
          addImportDeclaration(this.context.sourceFile, '@fresha/api-tools-core', 't:JSONValue');
          addImportDeclaration(this.context.sourceFile, '@fresha/api-tools-core', transformFunc);
          writer.writeLine(`const body = ${transformFunc}(params.body as unknown as JSONValue)`);
        } else {
          writer.writeLine('const body = params.body;');
        }
      }

      writer.writeLine('const request = {');
      writer.indent(() => {
        const httpMethod = this.context.operation.httpMethod.toUpperCase();
        if (httpMethod !== 'GET') {
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
              writer.writeLine(`'${headerName}': params.${varName}`);
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
        writer.writeLine('authorizeRequest(request, extraParams);');
        writer.newLine();
      }

      writer.writeLine('applyExtraParams(request, extraParams)');
      writer.newLine();

      if (this.parsesResponse) {
        if (this.responseType) {
          if (this.context.clientNaming) {
            const transformFunc = `${this.context.clientNaming}CaseDeep`;
            addImportDeclaration(this.context.sourceFile, '@fresha/api-tools-core', transformFunc);
            writer.writeLine(`let response = await callJsonApi(url, request);`);
            writer.newLine();
            writer.writeLine(`response = ${transformFunc}(response);`);
          } else {
            writer.writeLine(`const response = await callJsonApi(url, request);`);
          }
          writer.newLine();
          addImportDeclaration(this.context.sourceFile, './utils', 'dispatchSuccess');
          writer.writeLine(
            `dispatchSuccess('${this.name}', ${
              actionFuncHasParams ? 'params' : 'undefined'
            }, response)`,
          );
          writer.newLine();
          addImportDeclaration(this.context.sourceFile, './utils', 'transformResponse');
          writer.writeLine(
            `return transformResponse<${this.responseType.name}>('${this.name}', response)`,
          );
        } else {
          writer.writeLine(`await callJsonApi(url, request);`);
          writer.newLine();
          writer.writeLine(`return`);
        }
      } else {
        writer.writeLine(`const response = await callApi(url, request);`);
        writer.newLine();
        writer.writeLine(`return response;`);
      }
    });
  }

  protected generateJsDocs(actionFunc: FunctionDeclaration, actionFuncHasParams: boolean): void {
    actionFunc.addJsDoc(writer => {
      let addNL = false;
      if (this.context.operation.summary) {
        writer.write(this.context.operation.summary);
        addNL = true;
      }
      if (this.context.operation.description) {
        if (addNL) {
          writer.newLine();
          writer.newLine();
        }
        writer.write(this.context.operation.description);
        addNL = true;
      }
      if (addNL) {
        writer.newLine();
      }

      if (actionFuncHasParams) {
        writer.newLine();
        writer.writeLine('@param params call parameters');
        if (this.requestType) {
          writer.writeLine('@param params.body request body');
        }
        for (const [paramName, { parameter }] of this.parameterVars) {
          writer.writeLine(
            [
              '@param',
              parameter.required ? `params.${paramName}` : `[params.${paramName}]`,
              parameter.deprecated ? '(deprecated)' : '',
              parameter.description || '',
            ]
              .filter(part => !!part.length)
              .join(' '),
          );
        }
      }

      writer.newLine();
      writer.writeLine('@param [extraParams] additional parameters');
      writer.writeLine(
        '@param [extraParams.authCookieName] name of the authorization cookie for this request',
      );
      writer.writeLine(
        '@param [extraParams.authCookie] value of the authorization cookie for this request',
      );
      writer.writeLine(
        '@param [extraParams.xForwardedFor] sends X-Forwarded-For header with specified value',
      );
      writer.writeLine(
        '@param [extraParams.xForwardedHost] sends X-Forwarded-Host header with specified value',
      );
      writer.write(
        '@param [extraParams.xForwardedProto] sends X-Forwarded-Proto header with specified value',
      );
    });
  }

  protected generateParameters(actionFunc: FunctionDeclaration): void {
    actionFunc.getParameterOrThrow('extraParams').setHasQuestionToken(true);

    if (this.parameterVars.size || this.requestType) {
      const paramsType = actionFunc
        .getParameterOrThrow('params')
        .getTypeNodeOrThrow()
        .asKindOrThrow(SyntaxKind.TypeLiteral);

      if (this.requestType) {
        paramsType.addProperty({
          name: 'body',
          type: this.requestType.name,
          hasQuestionToken: !this.requestType.isRequired,
        });
      }

      for (const [paramName, paramInfo] of this.parameterVars) {
        if (paramInfo.typeString === 'JSONObject') {
          addImportDeclaration(this.context.sourceFile, '@fresha/api-tools-core', 't:JSONObject');
        } else if (paramInfo.typeString === 'JSONArray') {
          addImportDeclaration(this.context.sourceFile, '@fresha/api-tools-core', 't:JSONArray');
        }

        paramsType.addProperty({
          name: paramName,
          type: paramInfo.typeString,
          hasQuestionToken: !paramInfo.parameter.required,
        });
      }
    }
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
      return `\${params.${argName}}`;
    });

    return `\`${str}\``;
  }
}

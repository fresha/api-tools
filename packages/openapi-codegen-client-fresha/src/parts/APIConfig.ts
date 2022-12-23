import {
  addConstant,
  addFunction,
  addImportDeclarations,
  addObjectLiteralArrayProperty,
  addObjectLiteralObjectProperty,
  addObjectLiteralProperties,
  addObjectLiteralProperty,
  getOperationEntryKeyOrThrow,
  getOperationIdOrThrow,
  getOperations,
  pathUrlToUrlExp,
} from '@fresha/openapi-codegen-utils';
import { Expression, SourceFile, SyntaxKind, VariableDeclarationKind } from 'ts-morph';

import { APIOperationTemplateName, findOperationTemplate } from './operations';

import type { Context } from './types';

type APIOperationConfig =
  | APIOperationTemplateName
  | [
      APIOperationTemplateName,
      {
        name?: string;
        queryParams?: string[];
      },
    ];

type APIEntryConfig = {
  url: string;
  operations: APIOperationConfig[];
};

type APIEntryKey = string;

type APIEntriesConfig = Record<APIEntryKey, APIEntryConfig>;

// type APIConfig = {
//   rootUrl: APIRootURL;
//   entries: APIEntriesConfig;
// };

// type APIClientConfig = Record<APIRootURL, APIConfig>;

/**
 * Generates API initialization function, as well as configured API variable.
 */
export class APIConfig {
  protected readonly context: Context;
  readonly sourceFile: SourceFile;
  protected apiConfig: APIEntriesConfig;

  constructor(context: Context, sourceFile: SourceFile) {
    this.context = context;
    this.sourceFile = sourceFile;
    this.apiConfig = {};
  }

  collectData(): void {
    for (const operation of getOperations(this.context.openapi)) {
      this.context.logger.info(`Processing path item: "${operation.parent.pathUrl}"`);

      const entryKey = getOperationEntryKeyOrThrow(operation);

      let apiEntryConfig = this.apiConfig[entryKey];
      if (!apiEntryConfig) {
        apiEntryConfig = {
          url: pathUrlToUrlExp(operation.parent.pathUrl),
          operations: [],
        };
        this.apiConfig[entryKey] = apiEntryConfig;
      }

      const operationId = getOperationIdOrThrow(operation);
      const { template, name } = findOperationTemplate(
        operation.httpMethod,
        operation.parent.pathUrl,
        entryKey,
        operationId,
      );
      const queryParams = operation.parameters?.filter(p => p.in === 'query').map(p => p.name);
      const templateActionName = template.actionName(entryKey);

      let operConfig: APIOperationConfig = name;
      if (templateActionName !== operationId) {
        if (queryParams?.length) {
          operConfig = [name, { queryParams }];
        } else {
          operConfig = [name, { name: operationId }];
        }
      } else if (queryParams?.length) {
        operConfig = [name, { queryParams }];
      }

      apiEntryConfig.operations.push(operConfig);
    }
  }

  generateCode(): void {
    this.context.logger.info(
      `Found configuration for ${this.context.apiRootUrl} ${JSON.stringify(
        this.apiConfig,
        null,
        2,
      )}`,
    );

    addImportDeclarations(this.sourceFile, {
      '@fresha/connector-utils/build/types/api': ['APIEnvironmentOptions'],
      '@fresha/redux-store': ['.:store'],
      '@fresha/connector-utils/build/apiConfig': ['configureApi'],
      '@fresha/connector-utils/build/boundActions': ['boundActions'],
      '@fresha/connector-utils/build/env': ['env'],
    });

    this.generateMakeApiConfig();

    addConstant(this.sourceFile, 'apiConfig', 'makeApiConfig(env)');
    addConstant(
      this.sourceFile,
      'configuredApi',
      `configureApi([apiConfig], '${this.context.apiName}')`,
      true,
    );
  }

  protected generateMakeApiConfig(): void {
    const initFunctionDecl = addFunction(
      this.sourceFile,
      'makeApiConfig',
      {
        [`{ ${this.context.apiRootUrl} }`]: `Pick<APIEnvironmentOptions, '${this.context.apiRootUrl}'>`,
      },
      undefined,
      true,
    );
    initFunctionDecl.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [
        {
          name: 'config',
          initializer: '[{}, {}] as const',
        },
      ],
    });
    initFunctionDecl.addStatements('return config;');

    const configElementsObj = initFunctionDecl
      .getVariableDeclarationOrThrow('config')
      .getInitializerIfKindOrThrow(SyntaxKind.AsExpression)
      .getExpressionIfKindOrThrow(SyntaxKind.ArrayLiteralExpression)
      .getElements();

    this.generateEntryConfigs(configElementsObj[0]);
    this.generateCommonConfig(configElementsObj[1]);
  }

  protected generateEntryConfigs(configElementObj: Expression): void {
    const entriesConfigObj = configElementObj.asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    for (const [entryKey, entryConfig] of Object.entries(this.apiConfig)) {
      const entryObj = addObjectLiteralObjectProperty(entriesConfigObj, entryKey);

      addObjectLiteralProperty(entryObj, 'url', `'${entryConfig.url}'`);

      const operationsObj = addObjectLiteralArrayProperty(entryObj, 'operations');
      for (const operConfig of entryConfig.operations) {
        if (typeof operConfig === 'string') {
          operationsObj.addElement(`'${operConfig}'`);
        } else {
          const [templateName, overrides] = operConfig;
          const overridesObj = operationsObj
            .addElement(`['${templateName}', {}]`)
            .asKindOrThrow(SyntaxKind.ArrayLiteralExpression)
            .getElements()[1]
            .asKindOrThrow(SyntaxKind.ObjectLiteralExpression);
          if (overrides.name) {
            addObjectLiteralProperty(overridesObj, 'actionName', `'${overrides.name}'`);
          }
          if (overrides.queryParams?.length) {
            const queryParamsObj = addObjectLiteralArrayProperty(overridesObj, 'queryParams');
            for (const paramName of overrides.queryParams) {
              queryParamsObj.addElement(`'${paramName}'`);
            }
          }
        }
      }
    }
  }

  protected generateCommonConfig(configElementObj: Expression): void {
    addObjectLiteralProperties(configElementObj.asKindOrThrow(SyntaxKind.ObjectLiteralExpression), {
      rootUrl: this.context.apiRootUrl,
      adapter: `'${this.context.useJsonApi ? 'jsonapi' : 'raw'}'`,
    });
  }
}

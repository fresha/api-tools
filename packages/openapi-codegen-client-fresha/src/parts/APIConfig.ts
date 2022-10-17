import { camelCase } from '@fresha/api-tools-core';
import { PathItemModel } from '@fresha/openapi-model/build/3.0.3';
import { Expression, SourceFile, SyntaxKind, VariableDeclarationKind } from 'ts-morph';

import { Logger } from '../utils/logging';
import {
  getOperationEntryKeyOrThrow,
  getOperationIdOrThrow,
  getRootUrlOrThrow,
} from '../utils/openapi';
import {
  addArrayProperty,
  addImportDeclarations,
  addObjectProperty,
  addProperties,
  addProperty,
  addVariableStatements,
} from '../utils/tsMorph';

import { APIOperationTemplateName, findOperationTemplate } from './operations';

import type { Generator } from '../Generator';

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

type APIRootURL = string;

// type APIConfig = {
//   rootUrl: APIRootURL;
//   entries: APIEntriesConfig;
// };

// type APIClientConfig = Record<APIRootURL, APIConfig>;

export class APIConfig {
  static convertPathUrlToConfigUrl(pathItemUrl: string): string {
    return pathItemUrl
      .replace(/^\//, '')
      .replace(/\{[a-zA-Z0-9_-]+\}/g, (m: string): string => `:${camelCase(m.slice(1, -1))}`);
  }

  protected readonly parent: Generator;
  protected readonly tsSourceFile: SourceFile;
  protected readonly logger: Logger;
  protected apiRootUrl: APIRootURL;
  protected apiConfig: APIEntriesConfig;

  constructor(parent: Generator) {
    this.parent = parent;
    this.tsSourceFile = this.parent.tsSourceFile;
    this.logger = this.parent.logger;
    this.apiRootUrl = 'API_URL';
    this.apiConfig = {};
  }

  collectData(): void {
    try {
      this.apiRootUrl = getRootUrlOrThrow(this.parent.openapi);
    } catch (err) {
      this.logger.warn(err);
      this.apiRootUrl = 'API_URL';
    }

    for (const [pathUrl, pathItem] of this.parent.openapi.paths) {
      this.processPathItem(pathUrl, pathItem);
    }
  }

  protected processPathItem(pathUrl: string, pathItem: PathItemModel): void {
    for (const [operationKey, operation] of pathItem.operations()) {
      this.logger.info(`Processing path item: "${pathUrl}"`);

      const entryKey = getOperationEntryKeyOrThrow(operation);

      let apiEntryConfig = this.apiConfig[entryKey];
      if (!apiEntryConfig) {
        apiEntryConfig = {
          url: APIConfig.convertPathUrlToConfigUrl(pathUrl),
          operations: [],
        };
        this.apiConfig[entryKey] = apiEntryConfig;
      }

      const operationId = getOperationIdOrThrow(operation);
      const { template, name } = findOperationTemplate(
        operationKey,
        pathUrl,
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
    this.logger.info(
      `Found configuration for ${this.apiRootUrl} ${JSON.stringify(this.apiConfig, null, 2)}`,
    );

    addImportDeclarations(this.tsSourceFile, {
      '!@fresha/connector-utils/build/types/api': ['APIEnvironmentOptions'],
      '@fresha/redux-store': ['!store'],
      '@fresha/connector-utils/build/apiConfig': ['configureApi'],
      '@fresha/connector-utils/build/boundActions': ['boundActions'],
      '@fresha/connector-utils/build/env': ['env'],
    });

    this.generateMakeApiConfig();

    addVariableStatements(this.tsSourceFile, {
      apiConfig: 'makeApiConfig(env)',
      configuredApi: `configureApi([apiConfig], '${this.parent.apiName}')`,
    });
  }

  protected generateMakeApiConfig(): void {
    const initFunctionDecl = this.tsSourceFile.addFunction({
      name: 'makeApiConfig',
    });
    initFunctionDecl.addParameter({
      name: `{ ${this.apiRootUrl} }`,
      type: `Pick<APIEnvironmentOptions, '${this.apiRootUrl}'>`,
    });
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
      const entryObj = addObjectProperty(entriesConfigObj, entryKey);

      addProperty(entryObj, 'url', `'${entryConfig.url}'`);

      const operationsObj = addArrayProperty(entryObj, 'operations');
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
            addProperty(overridesObj, 'actionName', `'${overrides.name}'`);
          }
          if (overrides.queryParams?.length) {
            const queryParamsObj = addArrayProperty(overridesObj, 'queryParams');
            for (const paramName of overrides.queryParams) {
              queryParamsObj.addElement(`'${paramName}'`);
            }
          }
        }
      }
    }
  }

  protected generateCommonConfig(configElementObj: Expression): void {
    addProperties(configElementObj.asKindOrThrow(SyntaxKind.ObjectLiteralExpression), {
      rootUrl: this.apiRootUrl,
      adapter: `'${this.parent.options.useJsonApi ? 'jsonapi' : 'raw'}'`,
    });
  }
}

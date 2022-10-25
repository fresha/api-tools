import path from 'path';

import {
  addFunction,
  addImportDeclaration,
  addObjectLiteralObjectProperty,
  addObjectLiteralProperty,
  Logger,
  pathUrlToUrlExp,
} from '@fresha/openapi-codegen-utils';
import {
  CodeBlockWriter,
  ObjectLiteralExpression,
  Project,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';

import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

type GeneratorOptions = {
  outputPath: string;
  useJsonApi: boolean;
  logger: Logger;
  verbose: boolean;
  dryRun: boolean;
};

export class Generator {
  readonly openapi: OpenAPIModel;
  readonly tsProject: Project;
  readonly options: GeneratorOptions;
  protected readonly tsSourceFile: SourceFile;
  protected readonly logger: Logger;

  constructor(openapi: OpenAPIModel, tsProject: Project, options: GeneratorOptions) {
    this.openapi = openapi;
    this.tsProject = tsProject;
    this.options = options;
    this.tsSourceFile = this.tsProject.createSourceFile(
      path.join(this.options.outputPath, 'src', 'server.ts'),
      '',
      { overwrite: true },
    );
    this.logger = this.options.logger;
  }

  // eslint-disable-next-line class-methods-use-this
  collectData(): void {}

  generateCode(): void {
    this.logger.info('Generating mock server code');

    addImportDeclaration(this.tsSourceFile, 'miragejs', 'createServer');
    addImportDeclaration(this.tsSourceFile, 'miragejs', 'Model');

    const initFunc = addFunction(this.tsSourceFile, 'init', {}, 'void', true);
    initFunc.addStatements((writer: CodeBlockWriter) => {
      writer.writeLine('createServer({});');
    });

    const initArg = initFunc
      .getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression)
      .getArguments()[0]
      .asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

    this.generateModelsMap(initArg);
    this.generateSeeds(initArg);
    this.generateRoutes(initArg);

    if (!this.options.dryRun) {
      this.tsProject.saveSync();
    }
  }

  protected generateModelsMap(initArg: ObjectLiteralExpression): void {
    const modelsMap = addObjectLiteralObjectProperty(initArg, 'models');
    this.logger.info('Generating model definitions');
    addObjectLiteralProperty(modelsMap, 'users', 'Model');
    addObjectLiteralProperty(modelsMap, 'pets', 'Model');
  }

  // eslint-disable-next-line class-methods-use-this
  protected generateSeeds(initArg: ObjectLiteralExpression): void {
    const seeds = initArg.addMethod({
      name: 'seeds',
      parameters: [{ name: 'server' }],
    });
    seeds.prependWhitespace('\n');
    seeds.addStatements((writer: CodeBlockWriter) => {
      writer.writeLine('// implement this method');
      writer.writeLine('// see https://miragejs.com/tutorial/part-4/ for more info');
      writer.writeLine("server.create('user', { name: 'Andriy' })");
      writer.writeLine("server.create('pet', { name: 'Rysiek Kocie Serce' })");
    });
  }

  protected generateRoutes(initArg: ObjectLiteralExpression): void {
    const routes = initArg.addMethod({
      name: 'routes',
    });
    routes.prependWhitespace('\n');

    for (const [pathUrl, pathItem] of this.openapi.paths) {
      const urlExp = pathUrlToUrlExp(pathUrl);

      for (const [method, operation] of pathItem.operations()) {
        routes.addStatements((writer: CodeBlockWriter) => {
          writer.writeLine(`this.${method}('${urlExp}', (schema, request) => {`);
          writer.indent(() => {
            for (const param of operation.parameters) {
              if (param.in === 'path') {
                writer.writeLine(`const ${param.name} = request.params.${param.name};`);
              } else if (param.in === 'query') {
                writer.writeLine(`const ${param.name} = request.queryParams.${param.name}`);
              }
            }

            writer.writeLine('// implement this method');
            writer.writeLine(
              '// for more details, please consult https://miragejs.com/tutorial/part-5/',
            );
          });
          writer.writeLine('});');
        });
      }
    }
  }
}

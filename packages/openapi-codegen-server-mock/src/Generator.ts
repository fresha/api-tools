import path from 'path';

import {
  Generator as GeneratorBase,
  addFunction,
  addImportDeclaration,
  addObjectLiteralObjectProperty,
  addObjectLiteralProperty,
  pathUrlToUrlExp,
} from '@fresha/openapi-codegen-utils';
import { CodeBlockWriter, ObjectLiteralExpression, SourceFile, SyntaxKind } from 'ts-morph';

import type { Context } from './types';

export class Generator extends GeneratorBase<Context> {
  protected readonly sourceFile: SourceFile;

  constructor(context: Context) {
    super(context);
    this.sourceFile = this.context.project.createSourceFile(
      path.join(this.context.outputPath, 'src', 'server.ts'),
      '',
      { overwrite: true },
    );
  }

  protected generateCode(): void {
    addImportDeclaration(this.sourceFile, 'miragejs', 'createServer');
    addImportDeclaration(this.sourceFile, 'miragejs', 'Model');

    const initFunc = addFunction(this.sourceFile, 'init', {}, 'void', true);
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

    if (!this.context.dryRun) {
      this.context.project.saveSync();
    }
  }

  protected generateModelsMap(initArg: ObjectLiteralExpression): void {
    const modelsMap = addObjectLiteralObjectProperty(initArg, 'models');
    this.context.logger.info('Generating model definitions');
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

    for (const [pathUrl, pathItem] of this.context.openapi.paths) {
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

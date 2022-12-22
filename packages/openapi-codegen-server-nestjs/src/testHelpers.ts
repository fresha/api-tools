import { Nullable } from '@fresha/api-tools-core';
import { createLogger, createConsole } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OpenAPIModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { Generator } from './Generator';

export const makeGenerator = (nestApp = 'app', rootDir = '/'): Generator => {
  const project = new Project({ useInMemoryFileSystem: true });
  project.createSourceFile(
    `${rootDir}/${nestApp}.module.ts`,
    `import { Module } from '@nestjs/common';
     import { AppController } from './app.controller';
     import { AppService } from './app.service';

     @Module({
       imports: [],
       controllers: [AppController],
       providers: [AppService],
     })
    export class AppModule {}`,
  );

  const console = createConsole(false);
  console.log = jest.fn();

  let generator: Generator;

  const context = {
    outputPath: rootDir,
    useJsonApi: true,
    dryRun: false,
    openapi: OpenAPIFactory.create(),
    project,
    console,
    logger: createLogger(false),
    nestApp,
    addDTO(name: string, schema: Nullable<SchemaModel>) {
      return generator.addDTO(name, schema);
    },
  };

  generator = new Generator(context);

  return generator;
};

type TestingContext = {
  openapi: OpenAPIModel;
  generator: Generator;
};

export const makeTestingContext = (phoenixApp = 'api_tools_web'): TestingContext => {
  const generator = makeGenerator(phoenixApp);
  return { generator, openapi: generator.context.openapi };
};

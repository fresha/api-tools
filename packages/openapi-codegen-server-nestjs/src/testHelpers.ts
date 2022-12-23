import { Nullable } from '@fresha/api-tools-core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createTSProjectTestContext } from '@fresha/openapi-codegen-test-utils';
import { OpenAPIFactory, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

import { Context } from './context';
import { Generator } from './Generator';

export const createTestContext = (nestApp = 'web', outputPath = '/tmp/'): Context => {
  const openapi = OpenAPIFactory.create();
  const base = createTSProjectTestContext(openapi, outputPath);

  base.project.createSourceFile(
    `${outputPath}/${nestApp}.module.ts`,
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

  return {
    ...base,
    nestApp,
    addDTO: jest.fn(),
  };
};

export const createGenerator = (nestApp = 'app', rootDir = '/'): Generator => {
  const context = createTestContext(nestApp, rootDir);

  let generator: Generator;
  // eslint-disable-next-line prefer-const
  generator = new Generator({
    ...context,
    addDTO: (name: string, schema: Nullable<SchemaModel>) => generator.addDTO(name, schema),
  });

  return generator;
};

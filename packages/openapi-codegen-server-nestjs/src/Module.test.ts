import { createConsole, createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { Module } from './Module';

import type { Controller } from './Controller';
import type { Context } from './types';

import '@fresha/code-morph-test-utils/build/matchers';

let context: Context | null = null;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();

  const project = new Project({ useInMemoryFileSystem: true });
  project.createSourceFile(
    '/tmp/web.module.ts',
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

  context = {
    openapi,
    outputPath: '/tmp/',
    nestApp: 'web',
    project,
    useJsonApi: true,
    dryRun: false,
    logger: createLogger(false),
    console: createConsole(false),
    addDTO: jest.fn(),
  };
});

test('construction', () => {
  const module = new Module(context!);
  expect(module.outputPath).toBe('/tmp/web.module.ts');
});

test('adds controller imports', () => {
  const module = new Module(context!);

  module.processController({ outputPath: '/tmp/web2.controller', className: 'WebX' } as Controller);
  module.processController({ outputPath: '/tmp/abcd.controller', className: 'WebZ' } as Controller);
  module.generateCode();

  const moduleSourceFile = module.context.project.getSourceFileOrThrow('/tmp/web.module.ts');
  expect(moduleSourceFile).toHaveFormattedTypeScriptText(
    `import { Module, ValidationPipe } from '@nestjs/common';
    import { AppController } from './app.controller';
    import { AppService } from './app.service';
    import { APP_PIPE } from '@nestjs/core';
    import { WebX } from './web2.controller';
    import { WebZ } from './abcd.controller';

    @Module({
      imports: [],
      controllers: [AppController, WebX, WebZ],
      providers: [
        AppService,
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    })
    export class AppModule {}
  `,
  );
});

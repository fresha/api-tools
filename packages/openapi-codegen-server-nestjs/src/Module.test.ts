import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { Generator } from './Generator';
import { Module } from './Module';

import type { Controller } from './Controller';

import '@fresha/jest-config/build/types';

let fakeGenerator: Generator | null = null;

const logger = createLogger(false);

beforeEach(() => {
  const openapi = OpenAPIFactory.create();

  const tsProject = new Project({ useInMemoryFileSystem: true });
  tsProject.createSourceFile(
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

  fakeGenerator = {
    openapi,
    outputPath: '/tmp/',
    nestApp: 'web',
    tsProject,
  } as Generator;
});

test('construction', () => {
  const module = new Module(fakeGenerator!, logger);
  expect(module.outputPath).toBe('/tmp/web.module.ts');
});

test('adds controller imports', () => {
  const module = new Module(fakeGenerator!, logger);

  module.processController({ outputPath: '/tmp/web2.controller', className: 'WebX' } as Controller);
  module.processController({ outputPath: '/tmp/abcd.controller', className: 'WebZ' } as Controller);
  module.generateCode();

  const moduleSourceFile = module.generator.tsProject.getSourceFileOrThrow('/tmp/web.module.ts');
  expect(moduleSourceFile).toHaveFormattedText(
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

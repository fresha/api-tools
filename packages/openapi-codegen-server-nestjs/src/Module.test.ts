import { Module } from './Module';
import { createTestContext } from './testHelpers';

import '@fresha/openapi-codegen-test-utils/build/matchers';

import type { Controller } from './Controller';

const createModule = (): Module => {
  const context = createTestContext();
  return new Module(context);
};

test('construction', () => {
  const module = createModule();
  expect(module.outputPath).toBe('/tmp/web.module.ts');
});

test('adds controller imports', () => {
  const module = createModule();

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

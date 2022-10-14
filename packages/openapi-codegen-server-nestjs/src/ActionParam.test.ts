import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';
import { MethodDeclaration, Project } from 'ts-morph';

import '@fresha/jest-config/build/types';

import { ActionParam } from './ActionParam';
import { createLogger } from './utils/logging';

import type { Action } from './Action';

let openapi: OpenAPIModel = {} as OpenAPIModel;
let methodDecl: MethodDeclaration = {} as MethodDeclaration;

const logger = createLogger(false);

beforeEach(() => {
  openapi = OpenAPIFactory.create();
  openapi.components.setSchema('BooleanParam', 'boolean');
  openapi.components.setSchema('ObjectParam', 'object');

  const tsProject = new Project({ useInMemoryFileSystem: true });
  const tsSourcFile = tsProject.createSourceFile(
    'param.ts',
    `class X {
      y() {}
     }`,
  );
  methodDecl = tsSourcFile.getClassOrThrow('X').getMethodOrThrow('y');
});

test('construction', () => {
  const param = new ActionParam({} as Action, { in: 'path', name: 'id', schema: null }, logger);
  param.generateCode(methodDecl);

  expect(methodDecl.getSourceFile()).toHaveFormattedText(
    `import { Param } from '@nestjs/common';

    class X {
      y(@Param('id') id: string) {}
    }`,
  );
});

test('typed parameters', () => {
  const param = new ActionParam(
    {} as Action,
    {
      in: 'path',
      name: 'id',
      schema: openapi.components.schemas.get('BooleanParam')!,
    },
    logger,
  );
  param.generateCode(methodDecl);

  expect(methodDecl.getSourceFile()).toHaveFormattedText(
    `import { Param, ParseBoolPipe } from '@nestjs/common';

    class X {
      y(@Param('id', ParseBoolPipe) id: boolean) {}
    }`,
  );
});

test('does not support non-primitive parameter schema', () => {
  const param = new ActionParam(
    {} as Action,
    {
      in: 'path',
      name: 'obj',
      schema: openapi.components.schemas.get('ObjectParam')!,
    },
    logger,
  );

  expect(() => param.generateCode(methodDecl)).toThrow();
});

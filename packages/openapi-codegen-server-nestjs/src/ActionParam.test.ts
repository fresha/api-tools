import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';
import { MethodDeclaration, Project } from 'ts-morph';

import { ActionParam } from './ActionParam';

import type { Context } from './context';

let openapi: OpenAPIModel = {} as OpenAPIModel;
let methodDecl: MethodDeclaration = {} as MethodDeclaration;

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
  const param = new ActionParam({} as Context, { in: 'path', name: 'id', schema: null });
  param.generateCode(methodDecl);

  expect(methodDecl.getSourceFile().getText()).toMatchSnapshot();
});

test('typed parameters', () => {
  const param = new ActionParam({} as Context, {
    in: 'path',
    name: 'id',
    schema: openapi.components.getSchema('BooleanParam')!,
  });
  param.generateCode(methodDecl);

  expect(methodDecl.getSourceFile().getText()).toMatchSnapshot();
});

test('does not support non-primitive parameter schema', () => {
  const param = new ActionParam({} as Context, {
    in: 'path',
    name: 'obj',
    schema: openapi.components.getSchema('ObjectParam')!,
  });

  expect(() => param.generateCode(methodDecl)).toThrow();
});

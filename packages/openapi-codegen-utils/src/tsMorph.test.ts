import { CodeBlockWriter, Project, SourceFile, SyntaxKind } from 'ts-morph';

import {
  addConstant,
  addDecorator,
  addFunction,
  addFunctionTypeProperty,
  addImportDeclaration,
  addImportDeclarations,
  addObjectLiteralArrayProperty,
  addObjectLiteralObjectProperty,
  addObjectLiteralProperties,
  addObjectLiteralProperty,
  addTypeAlias,
  addTypeLiteralAlias,
  addTypeLiteralProperty,
  addVariable,
} from './tsMorph';

import '@fresha/jest-config';

const makeSourceFile = (content = ''): SourceFile => {
  return new Project({ useInMemoryFileSystem: true }).createSourceFile('index.ts', content);
};

describe('addImportDeclaration', () => {
  test('happy path', () => {
    const sourceFile = makeSourceFile();

    addImportDeclaration(sourceFile, 'fs', '.:fs');
    addImportDeclaration(sourceFile, 'fs', 'readFile');
    addImportDeclaration(sourceFile, 'fs', 'readFileSync');
    addImportDeclaration(sourceFile, 'path', '.:path');
    addImportDeclaration(sourceFile, 'assert', '*:assert');

    expect(sourceFile).toHaveFormattedText(`
      import fs, { readFile, readFileSync } from 'fs';
      import path from 'path';
      import * as assert from 'assert';
    `);
  });

  test('default or star imports without aliases', () => {
    const sourceFile = makeSourceFile();

    expect(() => addImportDeclaration(sourceFile, 'fs', '.')).toThrow();
    expect(() => addImportDeclaration(sourceFile, 'fs', '*')).toThrow();
  });

  test('multiple calls', () => {
    const sourceFile = makeSourceFile();

    addImportDeclaration(sourceFile, 'fs', 't:readFile');

    expect(sourceFile).toHaveFormattedText(`
      import type { readFile } from 'fs';
    `);

    addImportDeclaration(sourceFile, 'fs', 'readFile');

    expect(sourceFile).toHaveFormattedText(`
      import { readFile } from 'fs';
    `);
  });
});

test('addImportDeclarations', () => {
  const sourceFile = makeSourceFile();

  addImportDeclarations(sourceFile, {
    fs: ['readFile', 't:readFileSync'],
    path: '*:path',
    assert: '.:assert',
  });

  expect(sourceFile).toHaveFormattedText(`
    import { readFile, readFileSync } from 'fs';
    import * as path from 'path';
    import assert from 'assert';
  `);
});

test('addConstant', () => {
  const sourceFile = makeSourceFile();

  addConstant(sourceFile, 'x', '2', true);
  addConstant(sourceFile, 'y', "'2'");

  expect(sourceFile).toHaveFormattedText(`
    export const x = 2;
    const y = '2';
  `);
});

test('addVariable', () => {
  const sourceFile = makeSourceFile();

  addVariable(sourceFile, 'x', '2', true);
  addVariable(sourceFile, 'y', "'2'");

  expect(sourceFile).toHaveFormattedText(`
    export let x = 2;
    let y = '2';
  `);
});

test('addFunction', () => {
  const sourceFile = makeSourceFile();

  addFunction(sourceFile, 'func1');
  addFunction(sourceFile, 'func2', { p1: 'number', p2: 'Date' }, 'number', true);

  expect(sourceFile).toHaveFormattedText(`
    function func1() {}

    export function func2(p1: number, p2: Date): number {}
  `);
});

test('addObjectLiteralProperty', () => {
  const sourceFile = makeSourceFile('const x = {};');
  const objectLiteral = sourceFile
    .getVariableDeclarationOrThrow('x')
    .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

  addObjectLiteralProperty(objectLiteral, 'p1', '12');
  addObjectLiteralProperty(objectLiteral, 'p2', "'val'");

  expect(sourceFile).toHaveFormattedText(`
    const x = {
      p1: 12,
      p2: 'val',
    };
  `);
});

test('addObjectLiteralProperties', () => {
  const sourceFile = makeSourceFile('const x = {};');
  const objectLiteral = sourceFile
    .getVariableDeclarationOrThrow('x')
    .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

  addObjectLiteralProperties(objectLiteral, {
    p1: '1',
    p2: "'2'",
    '[p3]': 'true',
    p4: '{ x: 12 }',
  });

  expect(sourceFile).toHaveFormattedText(`
    const x = {
      p1: 1,
      p2: '2',
      [p3]: true,
      p4: { x: 12 },
    };
  `);
});

test('addObjectLiteralObjectProperty', () => {
  const sourceFile = makeSourceFile('const x = {};');
  const objectLiteral = sourceFile
    .getVariableDeclarationOrThrow('x')
    .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

  addObjectLiteralObjectProperty(objectLiteral, 'p1');

  expect(sourceFile).toHaveFormattedText(`
    const x = {
      p1: {},
    };
  `);
});

test('addObjectLiteralArrayProperty', () => {
  const sourceFile = makeSourceFile('const x = {};');
  const objectLiteral = sourceFile
    .getVariableDeclarationOrThrow('x')
    .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);

  addObjectLiteralArrayProperty(objectLiteral, 'p1');

  expect(sourceFile).toHaveFormattedText(`
    const x = {
      p1: [],
    };
  `);
});

describe('addDecorator', () => {
  test('simple syntax', () => {
    const sourceFile = makeSourceFile();
    const klass = sourceFile.addClass({ name: 'Klassy' });

    addDecorator(klass, 'Deco');

    expect(sourceFile).toHaveFormattedText(`
      @Deco
      class Klassy {}
    `);
  });

  test('factory w/o arguments', () => {
    const sourceFile = makeSourceFile();
    const klass = sourceFile.addClass({ name: 'Klassy' });

    addDecorator(klass, 'Deco', undefined, undefined);

    expect(sourceFile).toHaveFormattedText(`
      @Deco()
      class Klassy {}
    `);
  });

  test('factory with arguments', () => {
    const sourceFile = makeSourceFile();
    const klass = sourceFile.addClass({ name: 'Klassy' });

    addDecorator(klass, 'Deco', 1, '3', (writer: CodeBlockWriter) => writer.write('true || false'));

    expect(sourceFile).toHaveFormattedText(`
      @Deco(1, '3', true || false)
      class Klassy {}
    `);
  });

  test('fist call is the closest to decorated object', () => {
    const sourceFile = makeSourceFile();
    const klass = sourceFile.addClass({ name: 'Klassy' });

    addDecorator(klass, 'Deco1');
    addDecorator(klass, 'Deco2');
    addDecorator(klass, 'Deco3');

    expect(sourceFile).toHaveFormattedText(`
      @Deco1
      @Deco2
      @Deco3
      class Klassy {}
    `);
  });
});

describe('addTypeAlias', () => {
  test('happy path', () => {
    const sourceFile = makeSourceFile();

    addTypeAlias(sourceFile, 'PrivateType', '{}', false);
    const publicTypeAlias = addTypeAlias(
      sourceFile,
      'PublicType',
      '[string, number, { x: object; }]',
      true,
    );

    expect(publicTypeAlias).toBe(sourceFile.getTypeAlias('PublicType'));
    expect(sourceFile).toHaveFormattedText(`
      type PrivateType = {};

      export type PublicType = [string, number, { x: object }];
    `);
  });

  test('throws if another type with the same name already exists', () => {
    const sourceFile = makeSourceFile('type AType = string;');

    expect(() => addTypeAlias(sourceFile, 'AType', '{}', true)).toThrow();
  });
});

test('addTypeLiteralAlias', () => {
  const sourceFile = makeSourceFile();

  const initializer = addTypeLiteralAlias(sourceFile, 'ObjType');

  expect(initializer.getKind()).toBe(SyntaxKind.TypeLiteral);
  expect(initializer.getParent()).toBe(sourceFile.getTypeAlias('ObjType'));
  expect(sourceFile).toHaveFormattedText('type ObjType = {};');
});

test('addTypeLiteralProperty', () => {
  const sourceFile = makeSourceFile('type TypeA = {};');

  const typeLiteral = sourceFile
    .getTypeAliasOrThrow('TypeA')
    .getTypeNode()!
    .asKindOrThrow(SyntaxKind.TypeLiteral);

  addTypeLiteralProperty(typeLiteral, 'prop', 'string');

  expect(sourceFile).toHaveFormattedText(`
    type TypeA = {
      prop: string;
    };
  `);
});

test('addFunctionTypeProperty', () => {
  const sourceFile = makeSourceFile();
  const typeLiteral = addTypeLiteralAlias(sourceFile, 'AType');

  addFunctionTypeProperty(typeLiteral, 'func', '(arg: number) => Promise<number>');

  expect(sourceFile).toHaveFormattedText(`
    type AType = {
      func: (arg: number) => Promise<number>;
    };
  `);
});
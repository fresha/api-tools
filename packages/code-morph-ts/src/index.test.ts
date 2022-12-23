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
  addTypeLiteralCall,
  addTypeLiteralProperty,
  addVariable,
} from './index';

import '@fresha/code-morph-test-utils/build/matchers';

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

    expect(sourceFile).toHaveFormattedTypeScriptText(`
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

    expect(sourceFile).toHaveFormattedTypeScriptText(`
      import type { readFile } from 'fs';
    `);

    addImportDeclaration(sourceFile, 'fs', 'readFile');

    expect(sourceFile).toHaveFormattedTypeScriptText(`
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

  expect(sourceFile).toHaveFormattedTypeScriptText(`
    import { readFile, readFileSync } from 'fs';
    import * as path from 'path';
    import assert from 'assert';
  `);
});

test('addConstant', () => {
  const sourceFile = makeSourceFile();

  addConstant(sourceFile, 'x', '2', true);
  addConstant(sourceFile, 'y', "'2'");

  expect(sourceFile).toHaveFormattedTypeScriptText(`
    export const x = 2;
    const y = '2';
  `);
});

test('addVariable', () => {
  const sourceFile = makeSourceFile();

  addVariable(sourceFile, 'x', '2', true);
  addVariable(sourceFile, 'y', "'2'");

  expect(sourceFile).toHaveFormattedTypeScriptText(`
    export let x = 2;
    let y = '2';
  `);
});

test('addFunction', () => {
  const sourceFile = makeSourceFile();

  addFunction(sourceFile, 'func1');
  addFunction(sourceFile, 'func2', { p1: 'number', p2: 'Date' }, 'number', true);

  expect(sourceFile).toHaveFormattedTypeScriptText(`
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

  expect(sourceFile).toHaveFormattedTypeScriptText(`
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

  expect(sourceFile).toHaveFormattedTypeScriptText(`
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

  expect(sourceFile).toHaveFormattedTypeScriptText(`
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

  expect(sourceFile).toHaveFormattedTypeScriptText(`
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

    expect(sourceFile).toHaveFormattedTypeScriptText(`
      @Deco
      class Klassy {}
    `);
  });

  test('factory w/o arguments', () => {
    const sourceFile = makeSourceFile();
    const klass = sourceFile.addClass({ name: 'Klassy' });

    addDecorator(klass, 'Deco', undefined, undefined);

    expect(sourceFile).toHaveFormattedTypeScriptText(`
      @Deco()
      class Klassy {}
    `);
  });

  test('factory with arguments', () => {
    const sourceFile = makeSourceFile();
    const klass = sourceFile.addClass({ name: 'Klassy' });

    addDecorator(klass, 'Deco', 1, '3', (writer: CodeBlockWriter) => writer.write('true || false'));

    expect(sourceFile).toHaveFormattedTypeScriptText(`
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

    expect(sourceFile).toHaveFormattedTypeScriptText(`
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
    expect(sourceFile).toHaveFormattedTypeScriptText(`
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
  expect(sourceFile).toHaveFormattedTypeScriptText('type ObjType = {};');
});

test('addTypeLiteralProperty', () => {
  const sourceFile = makeSourceFile('type TypeA = {};');

  const typeLiteral = sourceFile
    .getTypeAliasOrThrow('TypeA')
    .getTypeNode()!
    .asKindOrThrow(SyntaxKind.TypeLiteral);

  addTypeLiteralProperty(typeLiteral, 'prop', 'string');
  addTypeLiteralProperty(typeLiteral, 'fnProp', (writer: CodeBlockWriter) => {
    writer.writeLine('string | null');
  });

  expect(sourceFile).toHaveFormattedTypeScriptText(`
    type TypeA = {
      prop: string;
      fnProp: string | null;
    };
  `);
});

test('addFunctionTypeProperty', () => {
  const sourceFile = makeSourceFile();
  const typeLiteral = addTypeLiteralAlias(sourceFile, 'AType');

  addFunctionTypeProperty(typeLiteral, 'func', '(arg: number) => Promise<number>');

  expect(sourceFile).toHaveFormattedTypeScriptText(`
    type AType = {
      func: (arg: number) => Promise<number>;
    };
  `);
});

describe('addTypeLiteralCall', () => {
  test('minimalistic', () => {
    const sourceFile = makeSourceFile();
    const typeLiteral = addTypeLiteralAlias(sourceFile, 'AType');

    addTypeLiteralCall(typeLiteral);

    expect(sourceFile).toHaveFormattedTypeScriptText(`
      type AType = {
        (): void;
      };
    `);
  });

  test('with parameters and return type', () => {
    const sourceFile = makeSourceFile();
    const typeLiteral = addTypeLiteralAlias(sourceFile, 'AType');

    addTypeLiteralCall(typeLiteral, { p1: 'string', p2: '{ x: number }' }, 'Promise<number>');

    expect(sourceFile).toHaveFormattedTypeScriptText(`
      type AType = {
        (p1: string, p2: { x: number }): Promise<number>;
      };
    `);
  });

  test('multiple signatures', () => {
    const sourceFile = makeSourceFile();
    const typeLiteral = addTypeLiteralAlias(sourceFile, 'AType');

    addTypeLiteralCall(typeLiteral, { x: 'string' }, 'string');
    addTypeLiteralCall(typeLiteral, { x: 'number' }, 'number');

    expect(sourceFile).toHaveFormattedTypeScriptText(`
      type AType = {
        (x: string): string;
        (x: number): number;
      };
    `);
  });
});

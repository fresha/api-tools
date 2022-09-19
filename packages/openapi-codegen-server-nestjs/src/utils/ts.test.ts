import { ImportDeclaration, ImportSpecifier, Project, SourceFile } from 'ts-morph';

import { addNamedImport } from './ts';

const createSourceFile = (text: string): SourceFile => {
  const project = new Project();
  return project.createSourceFile('test.ts', text);
};

describe('addNamedImport', () => {
  test('simple case', () => {
    const sourceFile = createSourceFile('');
    addNamedImport(sourceFile, 'React', 'react');

    expect(
      sourceFile
        .getImportDeclaration('react')
        ?.getNamedImports()
        .find((spec: ImportSpecifier) => spec.getName() === 'React'),
    ).not.toBeNull();
  });

  test('multiple calls reuse existing declaration', () => {
    const sourceFile = createSourceFile('import React from "react";');
    addNamedImport(sourceFile, 'react', 'Fragment');

    expect(
      sourceFile
        .getImportDeclarations()
        .filter(
          (importDecl: ImportDeclaration) =>
            importDecl.getModuleSpecifier().getLiteralValue() === 'react',
        ),
    ).toHaveLength(1);
  });

  test('multiple calls do not create duplicate import specifiers', () => {
    const sourceFile = createSourceFile('');
    addNamedImport(sourceFile, 'react', 'useState');
    addNamedImport(sourceFile, 'react', 'useState');

    expect(
      sourceFile
        .getImportDeclarations()
        .filter(
          (importDecl: ImportDeclaration) =>
            importDecl.getModuleSpecifier().getLiteralValue() === 'react',
        ),
    ).toHaveLength(1);
    expect(
      sourceFile
        .getImportDeclaration('react')
        ?.getNamedImports()
        .filter((importSpec: ImportSpecifier) => importSpec.getName() === 'useState'),
    ).toHaveLength(1);
  });
});

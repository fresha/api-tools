import assert from 'assert';

import {
  ArrayLiteralExpression,
  FunctionTypeNode,
  ObjectLiteralExpression,
  PropertyAssignment,
  SourceFile,
  StructureKind,
  SyntaxKind,
  TypeAliasDeclaration,
  TypeLiteralNode,
  TypeNode,
  VariableDeclarationKind,
  VariableStatement,
} from 'ts-morph';

export const addImportDeclarations = (
  tsSourceFile: SourceFile,
  decls: Record<string, string[]>,
): void => {
  for (const [moduleSpecifier, importNames] of Object.entries(decls)) {
    const spec = tsSourceFile.addImportDeclaration({
      moduleSpecifier: moduleSpecifier.replace(/^!/g, ''),
    });
    for (const name of importNames) {
      if (name.startsWith('!')) {
        spec.setDefaultImport(name.replace(/^!/g, ''));
      } else {
        spec.addNamedImport(name);
      }
    }
    spec.setIsTypeOnly(moduleSpecifier.startsWith('!'));
  }
};

export const addVariableStatement = (
  tsSourceFile: SourceFile,
  name: string,
  initializer: string,
): VariableStatement => {
  return tsSourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [{ name: name.replace(/^!/g, ''), initializer }],
    isExported: name.startsWith('!'),
  });
};

export const addVariableStatements = (
  tsSourceFile: SourceFile,
  vars: Record<string, string>,
): void => {
  for (const [name, initializer] of Object.entries(vars)) {
    addVariableStatement(tsSourceFile, name, initializer);
  }
};

export const addTypeAlias = (
  tsSourceFile: SourceFile,
  name: string,
  type: string,
  isExported?: boolean,
): TypeLiteralNode => {
  const typeAliasDecl = tsSourceFile.addTypeAlias({ name, type, isExported });
  typeAliasDecl.prependWhitespace('\n');
  return typeAliasDecl.getNodeProperty('type').asKindOrThrow(SyntaxKind.TypeLiteral);
};

export const addTypeAliasOnce = (
  tsSourceFile: SourceFile,
  name: string,
  type: string,
  isExported?: boolean,
): TypeAliasDeclaration => {
  let typeAlias = tsSourceFile.getTypeAlias(name);
  if (!typeAlias) {
    typeAlias = tsSourceFile.addTypeAlias({ name, type, isExported });
    typeAlias.prependWhitespace('\n');
  }
  return typeAlias;
};

export const addTypeMember = (typ: TypeLiteralNode, name: string, type: string): TypeNode => {
  const result = typ
    .addMember({
      kind: StructureKind.PropertySignature,
      name,
      type,
    })
    .asKindOrThrow(SyntaxKind.PropertySignature)
    .getNodeProperty('type');
  assert(result);
  return result;
};

export const addFunctionTypeMember = (
  typ: TypeLiteralNode,
  name: string,
  type: string,
): FunctionTypeNode => {
  return addTypeMember(typ, name, type).asKindOrThrow(SyntaxKind.FunctionType);
};

export const addProperty = (
  obj: ObjectLiteralExpression,
  name: string,
  initializer: string,
): PropertyAssignment => {
  return obj
    .addProperty({
      kind: StructureKind.PropertyAssignment,
      name,
      initializer,
    })
    .asKindOrThrow(SyntaxKind.PropertyAssignment);
};

export const addObjectProperty = (
  obj: ObjectLiteralExpression,
  name: string,
): ObjectLiteralExpression => {
  const property = addProperty(obj, name, '{}');
  return property.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression);
};

export const addArrayProperty = (
  obj: ObjectLiteralExpression,
  name: string,
): ArrayLiteralExpression => {
  const property = addProperty(obj, name, '[]');
  return property.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
};

export const addProperties = (
  obj: ObjectLiteralExpression,
  props: Record<string, string>,
): void => {
  for (const [name, initializer] of Object.entries(props)) {
    addProperty(obj, name, initializer);
  }
};

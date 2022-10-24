import assert from 'assert';

import {
  ArrayLiteralExpression,
  CallSignatureDeclaration,
  CodeBlockWriter,
  DecoratableNode,
  Decorator,
  FunctionDeclaration,
  FunctionTypeNode,
  ImportDeclaration,
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

/**
 * Add import declaration to given source file. Allows to specify imports in consise
 * way. Also, coalesces imports for given module into one declaration.
 *
 * Each module imports may have one of formats:
 *
 * - .:alias - import alias from ...
 * - '*:alias' - import * as alias from ...
 * - 'name:alias' - import { name as alias } from ...
 * - 'name' - import { name } from ...
 *
 * optionally, 't:' prefix can be added to make import type-only.
 *
 * @see addImportDeclarations
 */
export const addImportDeclaration = (
  sourceFile: SourceFile,
  moduleSpecifier: string,
  moduleImport: string,
): void => {
  let importDecl = sourceFile.getImportDeclaration(
    (decl: ImportDeclaration) => decl.getModuleSpecifier().getLiteralValue() === moduleSpecifier,
  );
  if (!importDecl) {
    importDecl = sourceFile.addImportDeclaration({ moduleSpecifier });
  }

  const importParts = moduleImport.split(':');
  assert(
    importParts.length > 0 && importParts.length <= 3,
    `Cannot recognize import specifier '${moduleImport}'`,
  );

  const isTypeOnly = importParts[0] === 't';
  if (isTypeOnly) {
    importParts.shift();
  }

  assert(
    importParts[0] === '.' || importParts[0] === '*' ? importParts.length > 1 : true,
    `Default or star imports must have alias '${moduleImport}' ${String(importParts)}`,
  );

  if (importParts[0] === '.') {
    importDecl.setDefaultImport(importParts[1]);
    importDecl.setIsTypeOnly(isTypeOnly);
  } else if (importParts[0] === '*') {
    importDecl.setNamespaceImport(importParts[1]);
    importDecl.setIsTypeOnly(isTypeOnly);
  } else {
    let importSpec = importDecl.getNamedImports().find(spec => spec.getName() === importParts[0]);
    if (importSpec) {
      importSpec.remove();
    }
    importSpec = importDecl.addNamedImport({
      name: importParts[0],
      alias: importParts[1] ?? undefined,
    });
    if (
      importDecl.getNamedImports().length === 1 &&
      !importDecl.getDefaultImport() &&
      !importDecl.getNamespaceImport()
    ) {
      importDecl.setIsTypeOnly(isTypeOnly);
    } else if (importDecl.isTypeOnly() && !isTypeOnly) {
      importDecl.setIsTypeOnly(false);
    }
  }
};

/**
 * Add multiple import declarations to given source file. Allows to specify imports in consise
 * way. Also, coalesces imports for given module into one declaration.
 *
 * Import specifications should be passed as record, where keys are module specifiers and
 * values are either strings or arrays of strings. Each string may have one of formats:
 *
 * - .:alias - import alias from ...
 * - '*:alias' - import * as alias from ...
 * - 'name:alias' - import { name as alias } from ...
 * - 'name' - import { name } from ...
 *
 * optionally, 't:' prefix can be added to make import type-only.
 *
 * @see addImportDeclarations
 */
export const addImportDeclarations = (
  sourceFile: SourceFile,
  decls: Record<string, string | string[]>,
): void => {
  for (const [moduleSpecifier, moduleImports] of Object.entries(decls)) {
    const importSpecs = Array.isArray(moduleImports) ? moduleImports : [moduleImports];
    for (const importSpec of importSpecs) {
      addImportDeclaration(sourceFile, moduleSpecifier, importSpec);
    }
  }
};

/**
 * Defines a variable using const syntax, with given name and initializer and. Optionally,
 * the constant can be marked as exported.
 */
export const addConstant = (
  sourceFile: SourceFile,
  name: string,
  initializer: string,
  isExported?: boolean,
): VariableStatement => {
  return sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    declarations: [{ name, initializer }],
    isExported,
  });
};

/**
 * Defines a variable using let syntax, with given name and initializer and. Optionally,
 * the constant can be marked as exported.
 */
export const addVariable = (
  sourceFile: SourceFile,
  name: string,
  initializer: string,
  isExported?: boolean,
): VariableStatement => {
  return sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Let,
    declarations: [{ name, initializer }],
    isExported,
  });
};

/**
 * Adds function declaration to a source file. Name, parameters and return value type
 * can be specified. Optionally, function can be marked as exported.
 */
export const addFunction = (
  sourceFile: SourceFile,
  funcName: string,
  params?: Record<string, string>,
  returnType?: string,
  isExported?: boolean,
): FunctionDeclaration => {
  return sourceFile.addFunction({
    name: funcName,
    parameters: params
      ? Object.entries(params).map(([name, type]: [string, string]) => ({ name, type }))
      : undefined,
    returnType,
    isExported,
  });
};

/**
 * Given object literal, adds property to it. Property name and initializer can be customized.
 */
export const addObjectLiteralProperty = (
  objectLiteral: ObjectLiteralExpression,
  name: string,
  initializer: string,
): PropertyAssignment => {
  return objectLiteral
    .addProperty({
      kind: StructureKind.PropertyAssignment,
      name,
      initializer,
    })
    .asKindOrThrow(SyntaxKind.PropertyAssignment);
};

/**
 * Similar to addObjectLiteralProperty, but allows to add multiple properties at a time.
 *
 * @see addObjectLiteralProperty
 */
export const addObjectLiteralProperties = (
  objectLiteral: ObjectLiteralExpression,
  props: Record<string, string>,
): void => {
  for (const [name, initializer] of Object.entries(props)) {
    addObjectLiteralProperty(objectLiteral, name, initializer);
  }
};

/**
 * Shortcut to addObjectLiteralProperty which initializes property to an empty object. Also,
 * it returns that empty object literal, instead of property itself.
 *
 * @see addObjectLiteralProperty
 */
export const addObjectLiteralObjectProperty = (
  objectLiteral: ObjectLiteralExpression,
  name: string,
): ObjectLiteralExpression => {
  return addObjectLiteralProperty(objectLiteral, name, '{}').getInitializerIfKindOrThrow(
    SyntaxKind.ObjectLiteralExpression,
  );
};

/**
 * Shortcut to addObjectLiteralProperty which initializes property to an empty array. Also,
 * it returns that empty array literal, instead of property itself.
 *
 * @see addObjectLiteralProperty
 */
export const addObjectLiteralArrayProperty = (
  objectLiteral: ObjectLiteralExpression,
  name: string,
): ArrayLiteralExpression => {
  return addObjectLiteralProperty(objectLiteral, name, '[]').getInitializerIfKindOrThrow(
    SyntaxKind.ArrayLiteralExpression,
  );
};

/**
 * Adds decorator to a node. If decorator arguments are supplied, decorator itself is
 * made a factory (i.e. @Deco()); otherwise, the syntax will be @Deco.
 */
export const addDecorator = (
  node: DecoratableNode,
  name: string,
  ...args: (string | number | boolean | undefined | ((writer: CodeBlockWriter) => void))[]
): Decorator => {
  const decorator = node.addDecorator({ name });
  if (args.length) {
    decorator.setIsDecoratorFactory(true);
  }
  for (const arg of args) {
    if (arg !== undefined) {
      if (arg === true) {
        decorator.addArgument('true');
      } else if (arg === false) {
        decorator.addArgument('false');
      } else if (typeof arg === 'string') {
        decorator.addArgument(`'${arg}'`);
      } else if (typeof arg === 'number') {
        decorator.addArgument(`${arg}`);
      } else if (typeof arg === 'function') {
        decorator.addArgument(arg);
      }
    }
  }
  return decorator;
};

/**
 * Adds type alias to given source file. Returns type alias declaration node. Throws if
 * another alias with the same name already exists.
 */
export const addTypeAlias = (
  sourceFile: SourceFile,
  name: string,
  type: string,
  isExported?: boolean,
): TypeAliasDeclaration => {
  assert(
    !sourceFile.getTypeAlias(name),
    `Type alias ${name} already exists in ${sourceFile.getFilePath()}`,
  );
  const typeAlias = sourceFile.addTypeAlias({ name, type, isExported });
  typeAlias.prependWhitespace('\n');
  return typeAlias;
};

/**
 * Adds a type alias with given name, initialized by '{}'. Returns its initializer (type literal)
 * node. Throws if alias with same name already exists.
 *
 * @see addTypeAlias
 */
export const addTypeLiteralAlias = (
  sourceFile: SourceFile,
  name: string,
  isExported?: boolean,
): TypeLiteralNode => {
  return addTypeAlias(sourceFile, name, '{}', isExported)
    .getNodeProperty('type')
    .asKindOrThrow(SyntaxKind.TypeLiteral);
};

/**
 * Adds property signature to given type literal, with given property name and type.
 */
export const addTypeLiteralProperty = (
  typeLiteral: TypeLiteralNode,
  name: string,
  type: string,
): TypeNode => {
  const result = typeLiteral
    .addMember({
      kind: StructureKind.PropertySignature,
      name,
      type,
    })
    .asKindOrThrow(SyntaxKind.PropertySignature)
    .getNodeProperty('type');
  assert(result, `Expect type literal member '${name}' type to be defined`);
  return result;
};

/**
 * Similar to addTypeLiteralProperty, but additionally casts return value to FunctionTypeNode
 *
 * @see addTypeLiteralProperty
 */
export const addFunctionTypeProperty = (
  typeLiteral: TypeLiteralNode,
  name: string,
  type: string,
): FunctionTypeNode => {
  return addTypeLiteralProperty(typeLiteral, name, type).asKindOrThrow(SyntaxKind.FunctionType);
};

/**
 * Adds call signature to given type literal. One may pass map of parameters (keys are parameter
 * names, values are types),
 */
export const addTypeLiteralCall = (
  typeLiteral: TypeLiteralNode,
  params?: Record<string, string>,
  returnType?: string,
): CallSignatureDeclaration => {
  return typeLiteral.addCallSignature({
    parameters: params
      ? Object.entries(params).map(([name, type]: [string, string]) => ({ name, type }))
      : undefined,
    returnType,
  });
};

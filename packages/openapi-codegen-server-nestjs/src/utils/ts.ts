import {
  SourceFile,
  ts,
  printNode,
  DecoratableNode,
  Node,
  ImportSpecifier,
  Decorator,
} from 'ts-morph';

export const addNamedImport = (
  sourceFile: SourceFile,
  moduleSpecifier: string,
  importedName: string,
  localName?: string,
): ImportSpecifier | undefined => {
  let importDecl = sourceFile.getImportDeclaration(
    decl => decl.getModuleSpecifier().getLiteralValue() === moduleSpecifier,
  );
  if (!importDecl) {
    importDecl = sourceFile.addImportDeclaration({ moduleSpecifier });
  }

  const namedImports = importDecl.getNamedImports();
  if (!namedImports.find(elem => elem.getName() === importedName)) {
    return importDecl.addNamedImport({ name: importedName, alias: localName });
  }

  return undefined;
};

export const addCommonNestImports = (node: Node, ...importedNames: string[]): void => {
  const sourceFile = node.getSourceFile();
  for (const name of importedNames) {
    addNamedImport(sourceFile, '@nestjs/common', name);
  }
};

export const addClassValidatorImports = (node: Node, ...importedNames: string[]): void => {
  const sourceFile = node.getSourceFile();
  for (const name of importedNames) {
    addNamedImport(sourceFile, 'class-validator', name);
  }
};

export const addDecorator = (
  nodeToAdd: DecoratableNode,
  name: string,
  ...args: (string | number | boolean | undefined)[]
): Decorator => {
  const decorator = nodeToAdd.addDecorator({ name });
  if (args.length) {
    decorator.setIsDecoratorFactory(true);
  }
  for (const arg of args) {
    if (arg !== undefined) {
      if (arg === true) {
        decorator.addArgument(printNode(ts.factory.createTrue()));
      } else if (arg === false) {
        decorator.addArgument(printNode(ts.factory.createFalse()));
      } else if (typeof arg === 'string') {
        decorator.addArgument(printNode(ts.factory.createStringLiteral(arg, true)));
      } else if (typeof arg === 'number') {
        decorator.addArgument(printNode(ts.factory.createNumericLiteral(arg)));
      }
    }
  }
  return decorator;
};

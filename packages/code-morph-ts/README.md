# @fresha/code-morph-ts

This package simplifies programmatic generation and modification of TypeScript
code. It bases itself on `ts-morph`, providing additional functionality.

## Installation

```bash
$ npm install @fresha/code-morph-ts
```

## Usage

- `addImportDeclaration`, `addImportDeclarations` - add one or more import
  declarations. Prevents duplicate imports.
- `addConstant`, `addVariable` - define a constant or a variable
- `addFunction` - add a function declaration
- `addObjectLiteralProperty`, `addObjectLiteralProperties`,
  `addObjectLiteralObjectProperty`, `addObjectLiteralArrayProperty` - add one
  or more properties to an object literal
- `addDecorator` - add a decorator
- `addTypeAlias`, `addTypeLiteralAlias` - add type aliases
- `addTypeLiteralProperty`, `addFunctionTypeProperty`, `addTypeLiteralCall` -
  add one or more properties to type literals

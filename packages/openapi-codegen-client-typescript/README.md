# @fresha/openapi-codegen-client-typescript

OpenAPI code generator for TypeScript clients.

## Installation

This generator is installed along with `@fresha/openapi-codegen`.

```bash
$ npm install @fresha/openapi-codegen
```

## Usage

### Listing available options

```bash
npx fresha-openapi-codegen client-typescript --help
```

### Generating source code

```bash
npx fresha-openapi-codegen client-typescript \
  --input PATH_TO_OPENAPI_SCHEMA_FILE
  --output ROOT_DIR_OF_NESTJS_PROJECT
  --nest-app NAME_OF_NESTJS_SUBAPP
  --json-api
```

where:

`--json-api` is used to make generator generate the code according to JSON:API specification

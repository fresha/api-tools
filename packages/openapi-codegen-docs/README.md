# @fresha/openapi-codegen-docs-json-api

Documentation generator for OpenAPI schemas.

## Installation

This generator is installed along with `@fresha/openapi-codegen`.

```bash
$ npm install @fresha/openapi-codegen
```

## Usage

### Listing available options

```bash
npx fresha-openapi-codegen docs-json-api --help
```

### Generating source code

```bash
npx fresha-openapi-codegen docs-json-api \
  --input PATH_TO_OPENAPI_SCHEMA_FILE
  --output ROOT_DIR_NPM_PROJECT
  --json-api
```

where:

`--json-api` is used to make generator generate the code according to JSON:API specification

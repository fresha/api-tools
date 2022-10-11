# @fresha/openapi-codegen-client-fresha

OpenAPI code generator for Fresha clients.

## Installation

This generator is installed along with `@fresha/openapi-codegen`.

```bash
$ npm install @fresha/openapi-codegen
```

## Usage

### Listing available options

```bash
npx fresha-openapi-codegen client-fresha --help
```

### Generating source code

```bash
npx fresha-openapi-codegen client-fresha \
  --input PATH_TO_OPENAPI_SCHEMA_FILE
  --output PACKAGE_DIR
  --json-api
```

where:

`--json-api` is used to make generator generate the code according to JSON:API specification

# @fresha/openapi-codegen-client-fetch

OpenAPI code generator for TypeScript clients using Fetch API.

## Installation

This generator is installed along with `@fresha/openapi-codegen`.

```bash
$ npm install @fresha/openapi-codegen
```

## Usage

### Listing available options

```bash
npx fresha-openapi-codegen client-fetch --help
```

### Generating source code

```bash
npx fresha-openapi-codegen client-fetch \
  --input PATH_TO_OPENAPI_SCHEMA_FILE
  --output ROOT_DIR_NPM_PROJECT
  --json-api
```

where:

`--json-api` is used to make generator generate the code according to JSON:API specification

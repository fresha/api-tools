# @fresha/openapi-codegen-server-mock

OpenAPI code generator for [Mirage.js](https://miragejs.com) mock servers.

## Installation

This generator is installed along with `@fresha/openapi-codegen`.

```bash
$ npm install @fresha/openapi-codegen
```

## Usage

### Listing available options

```bash
npx fresha-openapi-codegen server-mock --help
```

### Generating source code

```bash
npx fresha-openapi-codegen server-mock \
  --input PATH_TO_OPENAPI_SCHEMA_FILE
  --output ROOT_DIR_OF_NPM_PROJECT
  --json-api
```

where:

`--json-api` is used to make generator generate the code according to JSON:API specification

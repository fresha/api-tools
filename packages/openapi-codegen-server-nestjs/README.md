# @fresha/openapi-codegen-server-nestjs

OpenAPI code generator for NestJS projects.

## Installation

This generator is installed along with `@fresha/openapi-codegen`.

```bash
$ npm install @fresha/openapi-codegen
```

## Usage

### Listing available options

```bash
npx fresha-openapi-codegen server-nestjs --help
```

### Generating source code

```bash
npx fresha-openapi-codegen \
  --input PATH_TO_OPENAPI_SCHEMA_FILE
  --output ROOT_DIR_OF_NESTJS_PROJECT
  --nest-app NAME_OF_NESTJS_SUBAPP
  --json-api
```

where:

`--nest-app` is used to identify NestJS sub-app where new code should be generated.
  If omitted, generator assume that your NestJS project does not use sub-apps.

`--json-api` is used to make generator generate the code according to JSON:API specification

Code generator tries to generate code compliant with NestJS best practices. This includes:

- controllers
- actions
- DTO objects, implemented using `class-validator` library

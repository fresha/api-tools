# @fresha/openapi-codegen-server-elixir

**Experimental** OpenAPI code generator for Elixir (Phoenix) projects.

## Installation

This generator is installed along with `@fresha/openapi-codegen`.

```bash
$ npm install @fresha/openapi-codegen
```

## Usage

### Listing available options

```bash
npx fresha-openapi-codegen server-elixir --help
```

### Generating source code

```bash
npx fresha-openapi-elixir \
  --input PATH_TO_OPENAPI_SCHEMA_FILE
  --output ROOT_DIR_OF_ELIXIR_PROJECT
  --phoenix-app NAME_OF_PHOENIX_APP
  --json-api
```

where:

`--phoenix-app` is used to identify Phoenix sub-app where new code should be generated.
  If omitted, generator assume that your Phoenix project is not an umbrella project.

`--json-api` is used to make generator generate the code according to JSON:API specification

Code generator tries to generate code compliant with Phoenix best practices. This includes:

- controllers
- actions
- routing

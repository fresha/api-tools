# @fresha/openapi-codegen-server-elixir

**Experimental** OpenAPI code generator for Elixir (Phoenix) projects.

## Prerequisites

In order to use this generator, you need to have Node >= 16.x installed on your machine.

## Installation

This generator is installed along with `@fresha/openapi-codegen-cli`.

```bash
$ npm install @fresha/openapi-codegen-cli
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
  --test-factory-module EX_MACHINA_FACTORY_MODULE
  --json-api
```

where:

`--phoenix-app` is used to identify Phoenix sub-app where new code should be generated.
  If omitted, generator assume that your Phoenix project is not an umbrella project.

`--test-factory-module` should be a module name where ExMachina factory is located

`--json-api` is used to make generator generate the code according to JSON:API specification

Code generator tries to generate code compliant with Phoenix best practices. This includes:

- controllers
- controller actions
- controller test stubs
- views
- view test stubs
- JSON:API resources
- resource tests
- routing entries (printed on console)

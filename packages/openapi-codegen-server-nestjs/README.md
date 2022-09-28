# @fresha/openapi-codegen-server-nestjs

OpenAPI code generator for NestJS projects.

## Installation

If you need to generate source code using CLI tools, it's enough to install
`@fresha/openapi-codegen`.

```bash
$ npm install @fresha/openapi-codegen
```

## Usage

This generator is available as `server-nestjs` command of the `fresha-openapi-codegen` CLI.

```bash
npx fresha-openapi-codegen \
  server-nestjs \
  --input PATH_TO_OPENAPI_SCHEMA_FILE
  --output ROOT_DIR_OF_NESTJS_PROJECT
  --nest-app NAME_OF_NESTJS_SUBAPP
  --json-api
```

where:

`--nest-app` is used if your NestJS project uses [workspaces](https://docs.nestjs.com/cli/monorepo)
  This option's value should be one of NestJS applications from your project. If omitted, generator
  assumes that your NestJS project is in standard mode

`--json-api` is used to make generator generate the code according to JSON:API specification,
  including several optimisations

Other options include:

`--dry-run` which will make the generator to only print what it's being doing, but don't do actual
  modification

`--verbose` which will make the generator print more information on the console

## Code generation

Code generator tries to generate code compliant with NestJS best practices. This includes:

- module
- controllers
- actions
- DTO objects, implemented using `class-transformer` library

## Limitations

- generator may not fully work on update mode, when you have existing controllers and want
  to modify only parts of them
- after generating code, you may need to format it using project's settings. Usually it's done
  by invoking `npm run format` command

# Code generators

This document describes architecture of code generators.

`@fresha/openapi-codegen` - CLI. It is invoked as

`npx fresha-openapi-codegen <NAME> <OPTIONS>`, where `<NAME>` is supplied by concrete generator.

Each concrete generator type resides in a dedicated package.
For example, NestJS generators reside in `@fresha/openapi-codegen-server-nestjs`.

## Server

### NestJS

`npx fresha-openapi-codegen server-nestjs <OPTIONS>`

where `OPTIONS` may be one of:

- `-i`, `--input` - input schema
- `-o`, `--output` - output directory path. It should be the name of NestJS module
- `-v`, `--verbose` - prints additional information

Generates:

- controllers
- actions
- DTO objects
- schema definition (as a separate well-known endpoint)

## Elixir server

`npx fresha-openapi-codegen server-elixir <OPTIONS>`

Generates:

- routing
- controllers
- actions
- resources (DTO objects)

## Client

### TypeScript

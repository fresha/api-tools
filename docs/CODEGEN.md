# OpenAPI code generators

This document describes architecture of __OpenAPI code generators__.

In `api-tools`, OpenAPI code generation facility consists of a CLI package,
`@fresha/codegen-openapi`, and a number of concrete generators, each producing source code
for specific language, framework etc. CLI tool serves as an entry point, and generator packages
expose themselves as CLI commands.

## CLI

`@fresha/openapi-codegen` exposes a binary script `fresha-openapi-codegen`, which is the primary
interaction point for human developers. The script can be invoked as:

```bash
$ npx fresha-openapi-codegen <GENERATOR_COMMAND> <OPTIONS>
```

where `<GENERATOR_COMMAND>` and `<OPTIONS>` are generator name and options, correspondingly.

## Concrete generators

Each concrete generator type resides in a dedicated package. For example, NestJS generator resides
in `@fresha/openapi-codegen-server-nestjs`.

Each generator package exposes one or more CLI commands, precisely
(yargs command)[https://yargs.js.org/docs/#api-reference-commandcmd-desc-builder-handler], which is
later registered and exposed by `fresha-openapi-codegen`.

## Differences from Swagger codegen

Swagger developed a great set of tools. However, they don't fit well into our environment. I needed
to change several basic assumptions for `api-tools` code generators:

1. Generator packages are not restricted to using text-based templates (and templates in general).
    For example, JavaScript / TypeScript generators use AST-based generation extensively,
    via [ts-morph](https://www.npmjs.com/package/ts-morph).
2. Swagger UI model for generators concentrates on entities from OpenAPI schema (e.g. operation,
    request, response, etc.). `api-tools` generators concentrate on entities from target tech stack.
    For example, for Elixir or NestJS these can be controllers and actions, but for e.g. Django apps
    they can be views. To simplify development of next code generators, I plan to extract commonly
    used approaches to helper packages.
3. We explicitly support JSON:API specification
4. We use TypeScript instead of Java as the source language

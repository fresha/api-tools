# Coding

This document describes coding guidelines for `api-tools` project.

## Tooling

- prefer "mainstream" tools, unless they miss some critical functionality
- use same tools & versions for each project in the monorepo. This allows
  to hoist dependencies efficiently, thus reducing setup and CI time
- use same tool configuration for same kind of package. Configuration
  can be extended whenever it makes sense (for example, there should
  be a basic config for library packages, and an extended config
  for React-dependent projects)

## Monorepo

Top-level folder structure:

- `docs` - developer's documentation
- `packages` - feature packages
- `tools` - internal tools

## Packages

- use standard NPM script names for common operations
  - `build` - builds package's code
  - `build:watch` - build package's code in watch mode
  - `check` - perform all checks
  - `check:fix` - perform all checks with autofixing option
  - `clean` - removes all generated code
  - `dev` - (for apps) starts application in development
  - `lint` - run linter checks
  - `lint:fix` - run linter checks with autofixing option
  - `start` - (for apps) start application in production mode
  - `test` - run unit & integration checks

- use standard folder structure
  - `bin` - for binary scripts
  - `build` - for build output
  - `docs` - for developer's documentation
  - `src` - for source code

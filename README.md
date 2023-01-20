# api-tools

Next generation tools for Web API development. These include

- set of libraries
- a desktop application
- a Web application

aimed at simplifying development of Web APIs.

## Table of Content

1. [Typical use cases](#typical-use-cases)
2. [Using](#using)
3. [Development](#development)

<h2>Typical use cases</h2>

### Manage schemas

- edit API (OpenAPI, AsyncAPI) schema
  - textual view
  - tree-like view
  - form-based view
  - documentation preview
- support for JSON:API schemas
  - visually pleasant interface
  - visual presentation of relationships
- infer schema based on data or from existing APIs

### Generate software artefacts

- generate schema documentation
- generate client code based on OpenAPI spec
- generate server code based on OpenAPI spec
- generate API playground
  - web app
  - browser extension
  - VSCode extension ?
  - Electron app ?
- generate pseudo-random data based on OpenAPI schema
  - fake server, like mirage.js or rosie.js
  - can be used for benchmarking

### Validate code and data

- validate given API schema document
- validate data against API schema

### Collaborate

- manage schema libraries
  - per project / personal / global ?
  - best practices
    - e.g. HTTP status codes
    - pagination
    - schemas
  - API patterns & templates

<h2>Using</h2>

If you are a user, you may want to start with downloading command-line tools:

### OpenAPI schema linter

```bash
npm install @fresha/openapi-lint
```

### OpenAPI schema versioning & diffing tool

```bash
npm install @fresha/openapi-diff
```

### OpenAPI code generators

```bash
npm install @fresha/openapi-codegen-cli
```

<h2>Development</h2>

If you are willing to contribute to `api-tools`, great ! :) It is very simple

clone the repository

```bash
git clone https://github.com/fresha/api-tools
```

and build

```bash
npm run build
```

Voila, you are ready to making your first commit.

`api-tools` uses Lerna to automate day-to-day tasks. For most common of them,
shortcuts are defined:

```bash
npm run build     # build
npm run lint:fix  # run eslint with auto-fixing on
npm run test      # run tests
npm run check:fix # run lint, followed by running tests
```

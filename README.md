# api-tools

Next generation tools for Web API development. These include

- set of libraries
- a desktop application
- a Web application

aimed at simplifying development of Web APIs.

## Typical use cases

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

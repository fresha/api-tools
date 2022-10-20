# @fresha/openapi-codegen-cli

The code generator CLI for RESTful APIs.

## Installation

```bash
$ npm install @fresha/openapi-codegen-cli
```

## Usage

### Listing available generators

```bash
$ npx fresha-openapi-codegen --help
```

Typical output of the command above. Each generator is implemented as a separate command:

```text
Usage

Commands:
  fresha-openapi-codegen server-nestjs  generates code for NestJS

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

### Generating source code

As an example, we'll use NestJS generator. For more details, please see its documentation.

```bash
$ npx fresha-openapi-codegen server-nestjs \
  --input ~/Developer/openapi/schema.yaml \
  --output ~/Developer/nestjs-project
  --nest-app web
  --json-api
```

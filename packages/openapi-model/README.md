# @fresha/openapi-model

This package provides:

- type definitions for OpenAPI v3.x specifications objects
- high-level model classes for OpenAPI v3.0.3

Model classes serve as a foundation for other `api-tools`, like code generators, validators, etc.

## Installation

```bash
$ npm install @fresha/openapi-model
```

## Usage example

```ts
import { SchemaFactory, OpenAPIReader, OpenAPIWriter } from '@fresha/openapi-model/build/v3.0.3';

// 1. build schema programmatically

const openapiModel = SchemaFactory.create('My schema', '0.1.0');

const findUserOperationModel = openapiModel
  .setPathItem('/users')
  .addOperation('get');

const errorSchemaModel = openapiModel.components.setSchema('ErrorObject', 'object');
errorSchemaModel.setProperties({
  code: { type: 'number', required: true },
  title: { type: 'string', required: true },
  detail: 'string',
  href: 'string',
});

// 2. read schema from file

const openapiReader = new OpenAPIReader();
const loadedOpenapiModel = openapiReader.readFromFile('pathToSchemaFile.yaml');

// 3. serialise schema object to file

const openapiWriter = new OpenAPIWriter();
openapiWriter.writeToFile(openapiModel, 'pathToSchemaFile.yaml');
```

import fs from 'fs';
import path from 'path';

import yaml from 'yaml';

import { OpenAPI } from './OpenAPI';
import { OpenAPIReader } from './OpenAPIReader';
import { OpenAPIWriter } from './OpenAPIWriter';

import type { OpenAPIObject } from '../types';

test('minimalistic schema', () => {
  const openapi = new OpenAPI('Barebones', '1.2.3');

  const writer = new OpenAPIWriter();
  const openapiObject = writer.write(openapi);

  expect(openapiObject).toStrictEqual({
    openapi: '3.0.3',
    info: {
      title: 'Barebones',
      version: '1.2.3',
    },
    paths: {},
  });
});

test('serialises Contact object', () => {
  const openapi = new OpenAPI('Contact serialisation', '1.2.3');
  openapi.info.contact.name = 'Maintainer';
  openapi.info.contact.email = null;

  const writer = new OpenAPIWriter();
  const openapiObject = writer.write(openapi);

  expect(openapiObject.info.contact).toStrictEqual({
    name: 'Maintainer',
  });
});

test('serialises License object', () => {
  const openapi = new OpenAPI('License serialisation', '0.1.1');
  openapi.info.license.name = 'MIT';

  const writer = new OpenAPIWriter();
  const openapiObject = writer.write(openapi);

  expect(openapiObject.info.license).toStrictEqual({
    name: 'MIT',
  });
});

test('shared schemas + references', () => {
  const openapi = new OpenAPI('Shared schema test', '0.1.0');

  const errorSchema = openapi.components.setSchema('Error', 'object');
  errorSchema.setProperty('code', { type: 'integer', required: true });

  const errorListSchema = openapi.components.setSchema('ErrorList', 'array');
  errorListSchema.items = errorSchema;

  const writer = new OpenAPIWriter();
  const openapiObject = writer.write(openapi);

  expect(openapiObject.components?.schemas).toStrictEqual({
    Error: {
      type: 'object',
      required: ['code'],
      properties: {
        code: { type: 'integer' },
      },
    },
    ErrorList: {
      type: 'array',
      items: { $ref: '#/components/schemas/Error' },
    },
  });
});

test('serialises operation with inline schemas', () => {
  const openapi = new OpenAPI('Operation test', '0.1.0');

  const pathItem = openapi.setPathItem('/employees');
  const operation = pathItem.setOperation('post');
  const response = operation.responses.setDefaultResponse('Error response');
  const responseMediaType = response.setContent('application/json');
  const responseSchema = responseMediaType.setSchema('object');
  responseSchema.setProperty('code', { type: 'integer', required: true });

  const writer = new OpenAPIWriter();
  const openapiObject = writer.write(openapi);

  expect(openapiObject.paths['/employees']).toStrictEqual({
    post: {
      responses: {
        default: {
          description: 'Error response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code'],
                properties: {
                  code: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
  });
});

test('serialises operation with shared schemas', () => {
  const openapi = new OpenAPI('Operation test', '0.1.0');

  const errorSchema = openapi.components.setSchema('Error', 'object');
  errorSchema.setProperty('code', { type: 'integer', required: true });

  const errorListSchema = openapi.components.setSchema('ErrorList', 'array');
  errorListSchema.items = errorSchema;

  const employeesPathItem = openapi.setPathItem('/employees');

  const createEmployeeOperation = employeesPathItem.setOperation('post');
  const createEmployeeResponse =
    createEmployeeOperation.responses.setDefaultResponse('Error response');
  const createEmployeeResponseJson = createEmployeeResponse.setContent('application/json');
  createEmployeeResponseJson.schema = errorListSchema;

  const writer = new OpenAPIWriter();
  const openapiObject = writer.write(openapi);

  expect(openapiObject.paths['/employees']).toStrictEqual({
    post: {
      responses: {
        default: {
          description: 'Error response',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorList',
              },
            },
          },
        },
      },
    },
  });

  expect(openapiObject.components?.schemas).toStrictEqual({
    Error: {
      type: 'object',
      required: ['code'],
      properties: {
        code: { type: 'integer' },
      },
    },
    ErrorList: {
      type: 'array',
      items: { $ref: '#/components/schemas/Error' },
    },
  });
});

test.each(['api', 'callback', 'link', 'petstore', 'simple', 'uspto', 'json-api'])(
  'example - %s',
  stem => {
    const reader = new OpenAPIReader();

    const inputText = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'examples', `${stem}.yaml`),
      'utf-8',
    );
    const inputData = yaml.parse(inputText) as OpenAPIObject;

    const openapi = reader.parse(inputData);

    const writer = new OpenAPIWriter();
    const outputData = writer.write(openapi);

    expect(outputData).toStrictEqual(inputData);
  },
);

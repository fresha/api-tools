import fs from 'fs';
import path from 'path';

import yaml from 'yaml';

import { ExternalDocumentation } from './ExternalDocumentation';
import { OpenAPI, OpenAPIFactory } from './OpenAPI';
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

test('serializes tags', () => {
  const openapi = new OpenAPI('Barebones', '1.2.3');

  const t1 = openapi.addTag('t1');
  t1.description = 'The single tag';
  t1.externalDocs = new ExternalDocumentation(t1, 'http://www.example.com/docs');
  t1.externalDocs.description = '3rd party docs';
  t1.setExtension('x', 'y');

  const writer = new OpenAPIWriter();

  expect(writer.write(openapi)).toHaveProperty('tags', [
    {
      name: 't1',
      description: 'The single tag',
      'x-x': 'y',
      externalDocs: { description: '3rd party docs', url: 'http://www.example.com/docs' },
    },
  ]);
});

test('security schemas', () => {
  const openapi = OpenAPIFactory.create();

  const apiKeySchema = openapi.components.setSecuritySchema('key1', 'apiKey');
  apiKeySchema.setExtension('1', 12);

  const httpSchema = openapi.components.setSecuritySchema('key2', 'http');
  httpSchema.setExtension('2', 'aaa');

  const oauth2Schema = openapi.components.setSecuritySchema('key3', 'oauth2');
  oauth2Schema.setExtension('3', {});

  const openIdSchema = openapi.components.setSecuritySchema('key4', 'openIdConnect');
  openIdSchema.setExtension('4', []);

  const writer = new OpenAPIWriter();

  expect(writer.write(openapi)).toHaveProperty(['components', 'securitySchemes'], {
    key1: {
      in: 'header',
      name: 'key1',
      type: 'apiKey',
      'x-1': 12,
    },
    key2: {
      type: 'http',
      scheme: {},
      'x-2': 'aaa',
    },
    key3: {
      type: 'oauth2',
      flows: {},
      'x-3': {},
    },
    key4: {
      type: 'openIdConnect',
      openIdConnectUrl: 'http://www.example.com',
      'x-4': [],
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

import fs from 'fs';
import path from 'path';

import yaml from 'yaml';

import { OpenAPI } from './OpenAPI';
import { OpenAPIReader } from './OpenAPIReader';
import { OpenAPIWriter } from './OpenAPIWriter';

let openapi: OpenAPI;
let writer: OpenAPIWriter;

beforeEach(() => {
  openapi = new OpenAPI('Shared schema test', '0.1.0');
  writer = new OpenAPIWriter();
});

test('minimalistic schema', () => {
  expect(writer.write(openapi)).toStrictEqual({
    openapi: '3.0.3',
    info: {
      title: 'Shared schema test',
      version: '0.1.0',
    },
    paths: {},
  });
});

test('serialises Contact object', () => {
  openapi.info.contact.name = 'Maintainer';
  openapi.info.contact.email = null;

  const openapiObject = writer.write(openapi);

  expect(openapiObject.info.contact).toStrictEqual({
    name: 'Maintainer',
  });
});

test('serialises License object', () => {
  openapi.info.license.name = 'MIT';

  const openapiObject = writer.write(openapi);

  expect(openapiObject.info.license).toStrictEqual({
    name: 'MIT',
  });
});

test('shared schemas + references', () => {
  const errorSchema = openapi.components.setSchema('Error', {
    type: 'object',
    properties: { code: { type: 'integer', required: true } },
  });
  openapi.components.setSchema('ErrorList', 'array').setItems(errorSchema);

  const openapiObject = writer.write(openapi);

  expect(openapiObject.components?.schemas).toStrictEqual({
    Error: {
      title: 'Error',
      type: 'object',
      required: ['code'],
      properties: {
        code: { type: 'integer' },
      },
    },
    ErrorList: {
      title: 'ErrorList',
      type: 'array',
      items: { $ref: '#/components/schemas/Error' },
    },
  });
});

describe('path items', () => {
  test('simple properties', () => {
    const item1 = openapi.setPathItem('/one');
    item1.summary = '';
    item1.description = '';

    const item2 = openapi.setPathItem('/two');
    item2.summary = 'summary';
    item2.description = '**description**';

    const openapiObject = writer.write(openapi);

    expect(openapiObject).toHaveProperty('paths./one', {});
    expect(openapiObject).toHaveProperty('paths./two', {
      summary: 'summary',
      description: '**description**',
    });
  });

  test('custom servers', () => {
    openapi.addServer('http://global.example.com');

    openapi.paths.setPathItem('/default');

    const pathItem = openapi.paths.setPathItem('/overriding');
    pathItem.addServer('http://custom.example.com');

    const openapiObject = writer.write(openapi);

    expect(openapiObject).toHaveProperty('paths./default');
    expect(openapiObject).not.toHaveProperty('paths./default.servers');

    expect(openapiObject).toHaveProperty('paths./overriding.servers', [
      { url: 'http://custom.example.com' },
    ]);
  });

  test('custom parameters', () => {
    openapi.paths.setPathItem('/default');

    const pathItem = openapi.paths.setPathItem('/overriding');
    pathItem.addParameterModel(openapi.components.setParameter('shared', 'query', 'sharedParam'));
    pathItem.addParameter('inlineParam', 'query');

    const openapiObject = writer.write(openapi);

    expect(openapiObject).toHaveProperty('paths./default');
    expect(openapiObject).not.toHaveProperty('paths./default.parameters');

    expect(openapiObject).toHaveProperty('paths./overriding.parameters', [
      { $ref: '#/components/parameters/shared' },
      { name: 'inlineParam', in: 'query' },
    ]);
  });
});

describe('operations', () => {
  test('serialises operation with inline schemas', () => {
    openapi
      .setPathItem('/employees')
      .addOperation('post')
      .setDefaultResponse('Error response')
      .setMediaType('application/json')
      .setSchema({ type: 'object', properties: { code: { type: 'integer', required: true } } });

    const openapiObject = writer.write(openapi);

    expect(openapiObject).toHaveProperty('paths./employees', {
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
    const errorSchema = openapi.components.setSchema('Error', {
      type: 'object',
      properties: { code: { type: 'integer', required: true } },
    });

    const errorListSchema = openapi.components.setSchema('ErrorList', 'array');
    errorListSchema.setItems(errorSchema);

    const employeesPathItem = openapi.setPathItem('/employees');

    employeesPathItem
      .addOperation('post')
      .responses.setDefaultResponse('Error response')
      .setMediaType('application/json')
      .setSchema(errorListSchema);

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
        title: 'Error',
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'integer' },
        },
      },
      ErrorList: {
        title: 'ErrorList',
        type: 'array',
        items: { $ref: '#/components/schemas/Error' },
      },
    });
  });

  test('external documentation', () => {
    openapi.paths.setPathItem('/undocumented').addOperation('options');
    openapi.paths
      .setPathItem('/documented')
      .addOperation('trace')
      .setExternalDocs('http://docs.example.com');

    const openapiObject = writer.write(openapi);

    expect(openapiObject).not.toHaveProperty('paths./undocumented.options.externalDocs');
    expect(openapiObject).toHaveProperty(
      'paths./documented.trace.externalDocs.url',
      'http://docs.example.com',
    );
  });

  test('deprecated status', () => {
    openapi.paths.setPathItem('/deprecated').addOperation('get').deprecated = true;

    expect(writer.write(openapi)).toHaveProperty('paths./deprecated.get.deprecated', true);
  });

  test('serializes operation servers', () => {
    openapi.addServer('http://global.example.com');
    openapi.paths.setPathItem('/hello').addOperation('get').addServer('http://custom.example.com');

    const openapiObject = writer.write(openapi);

    expect(openapiObject).toHaveProperty('servers', [{ url: 'http://global.example.com' }]);
    expect(openapiObject).toHaveProperty('paths./hello.get.servers', [
      { url: 'http://custom.example.com' },
    ]);
  });

  test('serializes security requirements', () => {
    openapi.components.setSecuritySchema('global', 'oauth2');
    openapi.components.setSecuritySchema('local', 'apiKey');
    openapi.components.setSecuritySchema('alternative', 'http');

    openapi.addSecurityRequirement().addSchema('global');
    openapi.paths.setPathItem('/inherited').addOperation('post');
    openapi.paths
      .setPathItem('/overriden')
      .addOperation('delete')
      .addSecurityRequirement()
      .addSchema('local');
    openapi.paths.setPathItem('/empty').addOperation('get').clearSecurityRequirements();

    const openapiObject = writer.write(openapi);

    expect(openapiObject).toHaveProperty('security', [{ global: [] }]);
    expect(openapiObject).toHaveProperty('paths./overriden.delete.security', [{ local: [] }]);
    expect(openapiObject).toHaveProperty('paths./empty.get.security', []);
  });
});

describe('parameters', () => {
  test('header', () => {
    openapi.components.setParameter('HeaderParamWithDefaultProps', 'header', 'x-all-defaults');

    const param = openapi.components.setParameter('HeaderParam', 'header', 'x-param-1');
    param.required = true;
    param.explode = true;

    const openapiObject = writer.write(openapi);

    expect(openapiObject).toHaveProperty('components.parameters.HeaderParamWithDefaultProps', {
      name: 'x-all-defaults',
      in: 'header',
    });
    expect(openapiObject).toHaveProperty('components.parameters.HeaderParam', {
      name: 'x-param-1',
      in: 'header',
      required: true,
      explode: true,
    });
  });

  test('cookie', () => {
    openapi.components.setParameter('CookieParamWithDefaultProps', 'cookie', 'x-default');

    const param = openapi.components.setParameter('CookieParam', 'cookie', 'x-cookie-param');
    param.required = true;
    param.explode = false;

    const openapiObject = writer.write(openapi);

    expect(openapiObject).toHaveProperty('components.parameters.CookieParamWithDefaultProps', {
      name: 'x-default',
      in: 'cookie',
    });
    expect(openapiObject).toHaveProperty('components.parameters.CookieParam', {
      name: 'x-cookie-param',
      in: 'cookie',
      required: true,
      explode: false,
    });
  });
});

test('encodings', () => {
  const mediaType = openapi.components.setRequestBody('Req').setMediaType('multipart/mixed');

  mediaType.setSchema({
    type: 'object',
    properties: {
      avatar: {
        type: 'string',
        format: 'binary',
      },
    },
  });

  const avatarEncoding = mediaType.setEncoding('avatar');
  avatarEncoding.contentType = 'image/jpeg';

  const openapiObject = writer.write(openapi);

  expect(openapiObject).toHaveProperty(
    'components.requestBodies.Req.content.multipart/mixed.encoding',
    {
      avatar: {
        allowReserved: false,
        contentType: 'image/jpeg',
        explode: false,
        style: 'form',
      },
    },
  );
});

test('links', () => {
  openapi.components.setLink('Default');

  const server = openapi.addServer('http://api.example.com');

  const link = openapi.components.setLink('Custom');
  link.description = 'Link with properties set';
  link.setExtension('key', { a: 1, b: ['2', false] });
  link.operationId = 'readList';
  link.operationRef = '#/paths/hello/get';
  link.requestBody = {
    one: 12,
    two: 'alu',
    three: [false, true],
  };
  link.server = server;

  const openapiObject = writer.write(openapi);

  expect(openapiObject).toHaveProperty('components.links.Default', {});
  expect(openapiObject).toHaveProperty('components.links.Custom', {
    description: 'Link with properties set',
    operationId: 'readList',
    operationRef: '#/paths/hello/get',
    requestBody: {
      one: 12,
      two: 'alu',
      three: [false, true],
    },
    server: {
      url: 'http://api.example.com',
    },
    'x-key': {
      a: 1,
      b: ['2', false],
    },
  });
});

test('serializes tags', () => {
  const t1 = openapi.addTag('t1');
  t1.description = 'The single tag';
  const externalDocs = t1.setExternalDocs('http://www.example.com/docs');
  externalDocs.description = '3rd party docs';
  t1.setExtension('x', 'y');

  expect(writer.write(openapi)).toHaveProperty('tags', [
    {
      name: 't1',
      description: 'The single tag',
      'x-x': 'y',
      externalDocs: { description: '3rd party docs', url: 'http://www.example.com/docs' },
    },
  ]);
});

describe('security schemas', () => {
  test('basics', () => {
    openapi.components.setSecuritySchema('key1', 'apiKey').setExtension('1', 12);

    const httpSchema = openapi.components.setSecuritySchema('key2', 'http');
    httpSchema.bearerFormat = 'JWT';
    httpSchema.setExtension('2', 'aaa');

    openapi.components.setSecuritySchema('key3', 'oauth2').setExtension('3', {});
    openapi.components.setSecuritySchema('key4', 'openIdConnect').setExtension('4', []);

    const openapiObject = writer.write(openapi);

    expect(openapiObject).toHaveProperty('components.securitySchemes.key1', {
      in: 'header',
      name: 'key1',
      type: 'apiKey',
      'x-1': 12,
    });
    expect(openapiObject).toHaveProperty('components.securitySchemes.key2', {
      type: 'http',
      scheme: {},
      'x-2': 'aaa',
      bearerFormat: 'JWT',
    });
    expect(openapiObject).toHaveProperty('components.securitySchemes.key3', {
      type: 'oauth2',
      flows: {},
      'x-3': {},
    });
    expect(openapiObject).toHaveProperty('components.securitySchemes.key4', {
      type: 'openIdConnect',
      openIdConnectUrl: 'http://www.example.com',
      'x-4': [],
    });
  });

  test('oauth2 flows', () => {
    const { flows } = openapi.components.setSecuritySchema('auth', 'oauth2');

    const authCodeFlow = flows.setAuthorizationCode(
      'http://auth.auth-code.example.com',
      'http://token.auth-code.example.com',
    );
    authCodeFlow.refreshUrl = 'http://refresh.auth-code.example.com';
    authCodeFlow.addScope('basic', 'basic information');
    authCodeFlow.addScope('connections', 'information about connections');

    flows.setClientCredentials('http://token.client-creds.example.com');
    flows.setImplicit('http://auth.implicit.example.com');
    flows.setPassword('http://token.password.example.com');

    const openapiObject = writer.write(openapi);

    expect(openapiObject).toHaveProperty('components.securitySchemes.auth.flows', {
      authorizationCode: {
        authorizationUrl: 'http://auth.auth-code.example.com',
        tokenUrl: 'http://token.auth-code.example.com',
        scopes: {
          basic: 'basic information',
          connections: 'information about connections',
        },
      },
      clientCredentials: {
        scopes: {},
        tokenUrl: 'http://token.client-creds.example.com',
      },
      implicit: {
        authorizationUrl: 'http://auth.implicit.example.com',
        scopes: {},
      },
      password: {
        scopes: {},
        tokenUrl: 'http://token.password.example.com',
      },
    });
  });
});

describe('example schemas', () => {
  test.each(['api', 'callback', 'link', 'petstore', 'simple', 'uspto', 'json-api'])('%s', stem => {
    const inputFile = path.join(__dirname, '..', '..', '..', 'examples', `${stem}.yaml`);
    const inputData = yaml.parse(fs.readFileSync(inputFile, 'utf-8')) as unknown;

    const writtenData = writer.write(new OpenAPIReader().parseFromFile(inputFile));

    expect(writtenData).toStrictEqual(inputData);
  });
});

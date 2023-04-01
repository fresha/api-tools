import { OpenAPIReader } from './OpenAPIReader';

import type { OAuth2SecurityScheme } from './SecurityScheme';
import type { SchemaModel } from './types';
import type { OpenAPIObject, OperationObject, PathItemObject } from '../types';

let openapiObjectSkeleton: OpenAPIObject;
let reader: OpenAPIReader;

beforeEach(() => {
  openapiObjectSkeleton = {
    openapi: '3.0.3',
    info: {
      title: 'Barebones',
      version: '1.2.3',
    },
    paths: {},
    components: {},
  };
  reader = new OpenAPIReader();
});

test('barebones', () => {
  const openapi = reader.parse(openapiObjectSkeleton);

  expect(openapi.info.title).toBe('Barebones');
  expect(openapi.info.version).toBe('1.2.3');
  expect(openapi.paths.pathItemCount).toBe(0);
  expect(openapi.components.isEmpty()).toBeTruthy();
});

test('OpenAPIModel', () => {
  const openapi = reader.parse({
    ...openapiObjectSkeleton,
    externalDocs: {
      url: 'http://docs.example.com',
    },
  });

  expect(openapi).toHaveProperty('externalDocs.url', 'http://docs.example.com');
});

describe('SchemaModel', () => {
  test('sets correct default schema attributes', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        schemas: {
          EmptySchema: {},
        },
      },
    });

    expect(openapi.components.schemaCount).toBe(1);

    const emptySchema = openapi.components.getSchemaOrThrow('EmptySchema');
    expect(emptySchema).toHaveProperty('title', null);
    expect(emptySchema).toHaveProperty('multipleOf', null);
    expect(emptySchema).toHaveProperty('maximum', null);
    expect(emptySchema).toHaveProperty('exclusiveMaximum', false);
    expect(emptySchema).toHaveProperty('minimum', null);
    expect(emptySchema).toHaveProperty('exclusiveMinimum', false);
    expect(emptySchema).toHaveProperty('minLength', null);
    expect(emptySchema).toHaveProperty('maxLength', null);
    expect(emptySchema).toHaveProperty('pattern', null);
    expect(emptySchema).toHaveProperty('minItems', null);
    expect(emptySchema).toHaveProperty('maxItems', null);
    expect(emptySchema).toHaveProperty('uniqueItems', false);
    expect(emptySchema).toHaveProperty('minProperties', null);
    expect(emptySchema).toHaveProperty('maxProperties', null);
    expect(emptySchema).toHaveProperty('requiredPropertyCount', 0);
    expect(emptySchema).toHaveProperty('allowedValueCount', 0);
    expect(emptySchema).toHaveProperty('type', null);
    expect(emptySchema).toHaveProperty('allOfCount', 0);
    expect(emptySchema).toHaveProperty('oneOfCount', 0);
    expect(emptySchema).toHaveProperty('anyOfCount', 0);
    expect(emptySchema).toHaveProperty('not', null);
    expect(emptySchema).toHaveProperty('items', null);
    expect(new Map<string, SchemaModel>(emptySchema.properties())).toEqual(
      new Map<string, SchemaModel>(),
    );
    expect(emptySchema).toHaveProperty('additionalProperties', true);
    expect(emptySchema).toHaveProperty('description', null);
    expect(emptySchema).toHaveProperty('format', null);
    expect(emptySchema).toHaveProperty('default', null);
    expect(emptySchema).toHaveProperty('nullable', false);
    expect(emptySchema).toHaveProperty('discriminator', null);
    expect(emptySchema).toHaveProperty('readOnly', false);
    expect(emptySchema).toHaveProperty('writeOnly', false);
    expect(emptySchema).toHaveProperty('xml', null);
    expect(emptySchema).toHaveProperty('externalDocs', null);
    expect(emptySchema).toHaveProperty('example', null);
    expect(emptySchema).toHaveProperty('deprecated', false);
  });

  test('reads schema attributes', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        schemas: {
          ErrorMessage: {
            'x-prop-1': 'extension property 1',
            'x-prop-2': ['extension property 2'],
            title: 'error message schema',
            multipleOf: 4,
            maximum: 100,
            exclusiveMaximum: false,
            minimum: 10,
            exclusiveMinimum: true,
            minLength: 5,
            maxLength: 25,
            pattern: '*',
            maxItems: 10,
            minItems: 1,
            uniqueItems: true,
            minProperties: 2,
            maxProperties: 4,
            required: ['x', 'y'],
            enum: [1, '12', false],
            type: 'string',
            allOf: [{ type: 'object' }, { type: 'integer' }],
            oneOf: [{ type: 'object' }, { type: 'boolean' }],
            anyOf: [{ type: 'number' }],
            not: { type: 'array' },
            items: { type: 'integer' },
            properties: {
              x: { type: 'boolean' },
              y: {},
              z: {},
            },
            additionalProperties: false,
            description: '# This **is** markdown text',
            format: 'int64',
            default: 138472,
            nullable: true,
            discriminator: { propertyName: 'x' },
            readOnly: true,
            writeOnly: true,
            xml: {},
            externalDocs: { url: 'https://docs.example.com' },
            example: 12,
            deprecated: true,
          },
        },
      },
    });

    expect(openapi.components.schemaCount).toBe(1);

    const errorMessageSchema = openapi.components.getSchemaOrThrow('ErrorMessage');

    expect(errorMessageSchema).toHaveProperty('root', openapi);
    expect(errorMessageSchema).toHaveProperty('parent', openapi.components);
    expect(Array.from(errorMessageSchema.extensions())).toStrictEqual([
      ['prop-1', 'extension property 1'],
      ['prop-2', ['extension property 2']],
    ]);
    expect(errorMessageSchema).toHaveProperty('title', 'error message schema');
    expect(errorMessageSchema).toHaveProperty('multipleOf', 4);
    expect(errorMessageSchema).toHaveProperty('maximum', 100);
    expect(errorMessageSchema).toHaveProperty('exclusiveMaximum', false);
    expect(errorMessageSchema).toHaveProperty('minimum', 10);
    expect(errorMessageSchema).toHaveProperty('exclusiveMinimum', true);
    expect(errorMessageSchema).toHaveProperty('minLength', 5);
    expect(errorMessageSchema).toHaveProperty('maxLength', 25);
    expect(errorMessageSchema).toHaveProperty('pattern', '*');
    expect(errorMessageSchema).toHaveProperty('minItems', 1);
    expect(errorMessageSchema).toHaveProperty('maxItems', 10);
    expect(errorMessageSchema).toHaveProperty('uniqueItems', true);
    expect(errorMessageSchema).toHaveProperty('minProperties', 2);
    expect(errorMessageSchema).toHaveProperty('maxProperties', 4);
    expect(Array.from(errorMessageSchema.requiredPropertyNames())).toEqual(['x', 'y']);
    expect(Array.from(errorMessageSchema.allowedValues())).toEqual([1, '12', false]);
    expect(errorMessageSchema).toHaveProperty('type', 'string');

    const allOfSchemas = Array.from(errorMessageSchema?.allOf());
    expect(allOfSchemas.length).toBe(2);
    expect(allOfSchemas?.[0]).toHaveProperty('root', openapi);
    expect(allOfSchemas?.[0]).toHaveProperty('parent', errorMessageSchema);
    expect(allOfSchemas?.[0]).toHaveProperty('type', 'object');
    expect(allOfSchemas?.[1]).toHaveProperty('type', 'integer');

    const oneOfSchemas = Array.from(errorMessageSchema?.oneOf());
    expect(oneOfSchemas).toHaveProperty('length', 2);
    expect(oneOfSchemas?.[0]).toHaveProperty('type', 'object');
    expect(oneOfSchemas?.[1]).toHaveProperty('type', 'boolean');

    const anyOfSchemas = Array.from(errorMessageSchema?.anyOf());
    expect(anyOfSchemas?.length).toBe(1);
    expect(anyOfSchemas?.[0]).toHaveProperty('type', 'number');

    expect(errorMessageSchema?.not).toHaveProperty('type', 'array');

    const errorMessageItems = errorMessageSchema?.items;
    expect(errorMessageItems).toHaveProperty('root', openapi);
    expect(errorMessageItems).toHaveProperty('parent', errorMessageSchema);
    expect(errorMessageItems).toHaveProperty('type', 'integer');

    expect(errorMessageSchema?.propertyCount).toBe(3);

    const errorMessagePropertyX = errorMessageSchema?.getProperty('x');
    expect(errorMessagePropertyX).toHaveProperty('root', openapi);
    expect(errorMessagePropertyX).toHaveProperty('parent', errorMessageSchema);
    expect(errorMessagePropertyX).toHaveProperty('type', 'boolean');

    const errorMessagePropertyY = errorMessageSchema?.getProperty('y');
    expect(errorMessagePropertyY).toHaveProperty('root', openapi);
    expect(errorMessagePropertyY).toHaveProperty('parent', errorMessageSchema);

    const errorMessagePropertyZ = errorMessageSchema?.getProperty('z');
    expect(errorMessagePropertyZ).toHaveProperty('root', openapi);
    expect(errorMessagePropertyZ).toHaveProperty('parent', errorMessageSchema);

    expect(errorMessageSchema).toHaveProperty('additionalProperties', false);

    expect(errorMessageSchema).toHaveProperty('description', '# This **is** markdown text');
    expect(errorMessageSchema).toHaveProperty('format', 'int64');
    expect(errorMessageSchema).toHaveProperty('default', 138472);
    expect(errorMessageSchema).toHaveProperty('nullable', true);

    const errorMessageDiscriminator = errorMessageSchema?.discriminator;
    expect(errorMessageDiscriminator).toHaveProperty('root', openapi);
    expect(errorMessageDiscriminator).toHaveProperty('parent', errorMessageSchema);

    expect(errorMessageSchema).toHaveProperty('readOnly', true);
    expect(errorMessageSchema).toHaveProperty('writeOnly', true);

    const errorMessageXML = errorMessageSchema?.xml;
    expect(errorMessageXML).toHaveProperty('root', openapi);
    expect(errorMessageXML).toHaveProperty('parent', errorMessageSchema);

    const errorMessageDocs = errorMessageSchema?.externalDocs;
    expect(errorMessageDocs).toHaveProperty('root', openapi);
    expect(errorMessageDocs).toHaveProperty('parent', errorMessageSchema);

    expect(errorMessageSchema).toHaveProperty('example', 12);
    expect(errorMessageSchema).toHaveProperty('deprecated', true);
  });
});

describe('ComponentsModel', () => {
  test('schema references are read and resolved', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        schemas: {
          ErrorMessage: {
            type: 'string',
          },
          Error: {
            type: 'object',
            properties: {
              message: { $ref: '#/components/schemas/ErrorMessage' },
              code: {
                type: 'integer',
              },
            },
          },
          ErrorList: {
            type: 'array',
            items: { $ref: '#/components/schemas/Error' },
          },
        },
      },
    });

    expect(openapi.components.schemaCount).toBe(3);

    const errorMessageSchema = openapi.components.getSchema('ErrorMessage');
    expect(errorMessageSchema).toHaveProperty('root', openapi);
    expect(errorMessageSchema).toHaveProperty('parent', openapi.components);

    const errorSchema = openapi.components.getSchema('Error');
    expect(errorSchema).toHaveProperty('root', openapi);
    expect(errorSchema).toHaveProperty('parent', openapi.components);
    expect(errorSchema?.getProperty('message')).toBe(errorMessageSchema);

    const errorCodeSchema = errorSchema?.getProperty('code');
    expect(errorCodeSchema).toBeTruthy();
    expect(errorCodeSchema).toHaveProperty('root', openapi);
    expect(errorCodeSchema).toHaveProperty('parent', errorSchema);

    const errorListSchema = openapi.components.getSchema('ErrorList');
    expect(errorListSchema).toHaveProperty('root', openapi);
    expect(errorListSchema).toHaveProperty('parent', openapi.components);
  });

  test('parameters collection', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        parameters: {
          PathParam: {
            name: 'path-param',
            in: 'path',
            required: true,
            content: {
              'application/json': {
                schema: { type: 'string' },
              },
            },
          },
          QueryParam: {
            name: 'query-param',
            in: 'query',
            deprecated: true,
          },
          HeaderParam: {
            name: 'header-param',
            in: 'header',
          },
          CookieParam: {
            name: 'cookie-param',
            in: 'cookie',
          },
        },
      },
    });

    expect(openapi).toHaveProperty('components.parameterCount', 4);
    expect([...openapi.components.parameterKeys()]).toStrictEqual([
      'PathParam',
      'QueryParam',
      'HeaderParam',
      'CookieParam',
    ]);
  });

  test('headers collection', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        headers: {
          First: {
            required: true,
          },
          Second: {
            required: false,
          },
        },
      },
    });

    expect(openapi).toHaveProperty('components.headerCount', 2);
    expect([...openapi.components.headerKeys()]).toStrictEqual(['First', 'Second']);
  });

  test('response collection', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        responses: {
          First: {
            description: 'A response with headers',
            headers: {
              'content-disposition': {
                description: 'longer text',
                deprecated: false,
                required: true,
              },
            },
            links: {
              Link1: {},
            },
          },
        },
      },
    });

    const response = openapi.components.getResponseOrThrow('First');
    expect(response).toHaveProperty('description', 'A response with headers');

    expect(response).toHaveProperty('headerCount', 1);
    expect([...response.headerKeys()]).toStrictEqual(['content-disposition']);

    expect(response).toHaveProperty('linkCount', 1);
    expect([...response.linkKeys()]).toStrictEqual(['Link1']);
  });

  test('examples collection', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        examples: {
          First: {},
          Second: {},
        },
      },
    });

    expect(openapi.components).toHaveProperty('exampleCount', 2);
    expect([...openapi.components.exampleKeys()]).toStrictEqual(['First', 'Second']);
  });

  test('callbacks collection', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        callbacks: {
          First: {},
          Second: {},
        },
      },
    });

    expect(openapi.components).toHaveProperty('callbackCount', 2);
    expect([...openapi.components.callbackKeys()]).toStrictEqual(['First', 'Second']);
  });

  test('security scheme collection', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        securitySchemes: {
          ApiKey: {
            type: 'apiKey',
            name: 'key1',
            in: 'header',
          },
          Http: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          OAuth2: {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                authorizationUrl: 'http://auth.example.com',
                tokenUrl: 'http://token.example.com',
                scopes: {},
              },
              clientCredentials: {
                tokenUrl: 'http://token.example.com',
                refreshUrl: 'http://refresh.example.com',
                scopes: {},
              },
              implicit: {
                authorizationUrl: 'http://auth.example.com',
                scopes: {},
              },
              password: {
                tokenUrl: 'http://token.example.com',
                scopes: {},
              },
            },
          },
          OpenIdConnect: {
            type: 'openIdConnect',
            openIdConnectUrl: 'http://openid.example.com',
          },
        },
      },
    });

    expect(openapi.components.securitySchemaCount).toBe(4);

    const apiKeySchema = openapi.components.getSecuritySchemaOrThrow('ApiKey');
    expect(apiKeySchema).toHaveProperty('name', 'key1');

    const httpSchema = openapi.components.getSecuritySchemaOrThrow('Http');
    expect(httpSchema).toHaveProperty('bearerFormat', 'JWT');

    const oauth2Schema = openapi.components.getSecuritySchemaOrThrow('OAuth2');
    expect(oauth2Schema).toHaveProperty(
      'flows.authorizationCode.tokenUrl',
      'http://token.example.com',
    );

    const openIdConnectSchema = openapi.components.getSecuritySchemaOrThrow('OpenIdConnect');
    expect(openIdConnectSchema).toHaveProperty('openIdConnectUrl', 'http://openid.example.com');
  });
});

describe('PathItemModel', () => {
  test('parameters and servers', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      paths: {
        '/link/{path-param}': {
          parameters: [
            {
              name: 'path-param',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
            },
            {
              name: 'query-param',
              in: 'query',
              required: true,
              schema: { type: 'string' },
            },
          ],
          servers: [{ url: 'http://example.com' }],
        },
      },
    });

    const pathItem = openapi.paths.getItemOrThrow('/link/{path-param}');
    expect(pathItem).toHaveProperty('parameterCount', 2);

    const pathParam = pathItem.getParameter('path-param', 'path');
    expect(pathParam).toHaveProperty('required', true);
    expect(pathParam).toHaveProperty('schema.type', 'integer');

    const queryParam = pathItem.getParameter('query-param', 'query');
    expect(queryParam).toHaveProperty('required', true);
    expect(queryParam).toHaveProperty('schema.type', 'string');

    expect(pathItem).toHaveProperty('serverCount', 1);

    expect(pathItem.serverAt(0)).toHaveProperty('url', 'http://example.com');
  });

  test('throws on unknown method', () => {
    expect(() => {
      reader.parse({
        ...openapiObjectSkeleton,
        paths: {
          '/link': {
            invalid: {
              summary: 'Invalid method',
              operationId: 'createLink',
              responses: {
                default: {
                  description: 'Unexpected error',
                },
              },
            },
          } as PathItemObject,
        },
      });
    }).toThrow();
  });
});

describe('OperationModel', () => {
  test('OperationModel', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      paths: {
        '/link': {
          put: {
            operationId: 'updateLink',
            responses: {
              200: { $ref: '#/components/responses/Shared' },
            },
            externalDocs: { url: 'http://docs.example.com' },
            security: [{ ApiKey: ['scope1', 'scope2'] }],
          },
          post: {
            operationId: 'createLink',
            responses: {
              200: {
                description: 'Ok',
                content: {
                  'application/json': {
                    schema: { type: 'string' },
                  },
                },
              },
            },
            security: [{ ApiKey: [] }],
          },
        },
      },
      components: {
        responses: {
          Shared: {
            description: 'Shared response',
            content: {
              'application/vnd.api+json': {
                schema: { type: 'string' },
              },
            },
          },
        },
        securitySchemes: {
          ApiKey: {
            type: 'apiKey',
            name: 'key1',
            in: 'header',
          },
        },
      },
    });

    const createLinkOp = openapi.getPathItemOrThrow('/link').getOperationOrThrow('post');
    const createResponseMediaType = createLinkOp
      .getResponseOrThrow('200')
      .getMediaTypeOrThrow('application/json');

    expect(createResponseMediaType).toHaveProperty('schema.type', 'string');

    expect(createLinkOp.securityRequirementCount).toBe(1);
    const createLinkSecurityRequirement = createLinkOp.securityRequirementAt(0);
    expect(createLinkSecurityRequirement).toHaveProperty('schemaCount', 1);
    expect([...(createLinkSecurityRequirement?.getScopes('ApiKey') ?? [])]).toStrictEqual([]);

    const sharedResponse = openapi.components.getResponseOrThrow('Shared');

    const updateLinkOp = openapi.getPathItemOrThrow('/link').getOperationOrThrow('put');
    const updateResponse = updateLinkOp.getResponseOrThrow('200');

    expect(updateResponse).toBe(sharedResponse);

    expect(updateLinkOp.securityRequirementCount).toBe(1);

    const updateLinkSecurityRequirement = updateLinkOp.securityRequirementAt(0);
    expect(updateLinkSecurityRequirement).toHaveProperty('schemaCount', 1);
    expect([...(updateLinkSecurityRequirement?.getScopes('ApiKey') ?? [])]).toStrictEqual([
      'scope1',
      'scope2',
    ]);
  });

  test('throws when there are no responses defined', () => {
    expect(() => {
      reader.parse({
        ...openapiObjectSkeleton,
        paths: {
          '/link': {
            put: {
              operationId: 'updateLink',
            } as OperationObject,
          },
        },
      });
    }).toThrow();

    expect(() => {
      reader.parse({
        ...openapiObjectSkeleton,
        paths: {
          '/link': {
            put: {
              operationId: 'updateLink',
              responses: {},
            },
          },
        },
      });
    }).toThrow();
  });

  test('reads and resolves shared callback', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      paths: {
        '/link': {
          put: {
            operationId: 'updateLink',
            responses: {
              200: {
                description: 'Ok',
                content: {
                  'application/json': {
                    schema: { type: 'string' },
                  },
                },
              },
            },
            callbacks: {
              SharedCallback: { $ref: '#/components/callbacks/SharedCallback' },
            },
          },
        },
      },
      components: {
        callbacks: {
          SharedCallback: {},
        },
      },
    });

    const updateLinkOp = openapi.getPathItemOrThrow('/link').getOperationOrThrow('put');

    expect(updateLinkOp.hasCallback('SharedCallback')).toBe(true);

    const sharedCallback = openapi.components.getCallbackOrThrow('SharedCallback');
    expect(updateLinkOp.getCallbackOrThrow('SharedCallback')).toBe(sharedCallback);
  });

  test('throws if the callback field does not reference a callback object', () => {
    expect(() => {
      reader.parse({
        ...openapiObjectSkeleton,
        paths: {
          '/link': {
            put: {
              operationId: 'updateLink',
              responses: {
                200: {
                  description: 'Ok',
                  content: {
                    'application/json': {
                      schema: { type: 'string' },
                    },
                  },
                },
              },
              callbacks: {
                SharedCallback: { $ref: '#/components/callbacks/SharedSchema' },
              },
            },
          },
        },
        components: {
          schemas: {
            SharedSchema: { type: 'string' },
          },
          callbacks: {
            SharedCallback: {},
          },
        },
      });
    }).toThrow();
  });
});

describe('ParameterModel', () => {
  test('happy path', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        parameters: {
          SharedCookieParam: {
            name: 'cookie1',
            in: 'cookie',
            schema: { type: 'string' },
            style: 'form',
            explode: true,
            required: true,
          },
        },
      },
    });

    const param = openapi.components.getParameterOrThrow('SharedCookieParam');
    expect(param).toHaveProperty('name', 'cookie1');
    expect(param).toHaveProperty('in', 'cookie');
    expect(param).toHaveProperty('schema.type', 'string');
    expect(param).toHaveProperty('style', 'form');
    expect(param).toHaveProperty('explode', true);
    expect(param).toHaveProperty('required', true);
  });

  test('throws if a cookie parameter has wrong style', () => {
    expect(() => {
      reader.parse({
        ...openapiObjectSkeleton,
        components: {
          parameters: {
            SharedCookieParam: {
              name: 'cookie1',
              in: 'cookie',
              schema: { type: 'string' },
              style: 'form',
              explode: true,
              required: true,
            },
          },
        },
      });
    });
  });
});

test('MediaTypeModel', () => {
  const openapi = reader.parse({
    ...openapiObjectSkeleton,
    paths: {
      '/hello': {
        get: {
          responses: {
            200: {
              description: 'Ok',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      avatar: { type: 'string', format: 'binary' },
                    },
                  },
                  encoding: {
                    avatar: {
                      contentType: 'image/jpeg',
                      headers: {
                        'content-disposition': {
                          required: true,
                        },
                      },
                      explode: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const mediaType = openapi
    .getPathItemOrThrow('/hello')
    .getOperationOrThrow('get')
    .getResponseOrThrow('200')
    .getMediaTypeOrThrow('application/json');
  expect(mediaType).toHaveProperty('encodingCount', 1);
});

test('XMLModel', () => {
  const openapi = reader.parse({
    ...openapiObjectSkeleton,
    components: {
      schemas: {
        User: {
          xml: {
            name: 'user',
            namespace: 'http://example.com/schema/user',
            prefix: 'ns',
            attribute: true,
          },
        },
        Employee: {
          xml: {},
        },
      },
    },
  });

  const userXml = openapi.components.getSchemaOrThrow('User').xml;
  expect(userXml).toHaveProperty('name', 'user');
  expect(userXml).toHaveProperty('namespace', 'http://example.com/schema/user');
  expect(userXml).toHaveProperty('prefix', 'ns');
  expect(userXml).toHaveProperty('attribute', true);
  expect(userXml).toHaveProperty('wrapped', false);

  const employeeXml = openapi.components.getSchemaOrThrow('Employee').xml;
  expect(employeeXml).toHaveProperty('name', null);
  expect(employeeXml).toHaveProperty('namespace', null);
  expect(employeeXml).toHaveProperty('prefix', null);
  expect(employeeXml).toHaveProperty('attribute', false);
  expect(employeeXml).toHaveProperty('wrapped', false);
});

test('TagModel', () => {
  const openapi = reader.parse({
    ...openapiObjectSkeleton,
    tags: [
      {
        name: 'tag1',
        description: 'tag1 description',
        externalDocs: {
          url: 'http://docs.example.com',
          description: 'tag1 docs',
        },
      },
      {
        name: 'tag2',
      },
    ],
  });

  expect(openapi.tagCount).toBe(2);

  const tag1 = openapi.getTagOrThrow('tag1');
  expect(tag1).toHaveProperty('name', 'tag1');
  expect(tag1).toHaveProperty('description', 'tag1 description');

  const externalDocs1 = tag1.externalDocs;
  expect(externalDocs1).toHaveProperty('url', 'http://docs.example.com');
  expect(externalDocs1).toHaveProperty('description', 'tag1 docs');

  const tag2 = openapi.getTagOrThrow('tag2');
  expect(tag2).toHaveProperty('name', 'tag2');
  expect(tag2).toHaveProperty('description', null);
  expect(tag2).toHaveProperty('externalDocs', null);
});

describe('SecuritySchemaModel', () => {
  test('happy path', () => {
    const openapi = reader.parse({
      ...openapiObjectSkeleton,
      components: {
        securitySchemes: {
          HttpSecurity: {
            type: 'http',
            scheme: 'bearer',
          },
          ApiKeySecurity: {
            type: 'apiKey',
            name: 'x',
            in: 'cookie',
          },
          OAuth2Security: {
            type: 'oauth2',
            flows: {
              implicit: {
                authorizationUrl: 'http://example.com',
                scopes: {
                  read: 'read',
                  write: 'write',
                },
              },
              password: {
                tokenUrl: 'http://example.com',
                scopes: {
                  email: 'email',
                },
              },
              clientCredentials: {
                tokenUrl: 'http://example.com',
                scopes: {
                  show: 'show anything',
                },
              },
              authorizationCode: {
                authorizationUrl: 'http://example.com',
                tokenUrl: 'http://example.com',
                scopes: {},
              },
            },
          },
          OpenIdConnectSecurity: {
            type: 'openIdConnect',
            openIdConnectUrl: 'http://example.com',
          },
        },
      },
    });

    expect(openapi.components.securitySchemaCount).toBe(4);

    const httpSecurity = openapi.components.getSecuritySchemaOrThrow('HttpSecurity');
    expect(httpSecurity).toHaveProperty('type', 'http');
    expect(httpSecurity).toHaveProperty('scheme', 'bearer');
    expect(httpSecurity).toHaveProperty('bearerFormat', null);

    const apiKeySecurity = openapi.components.getSecuritySchemaOrThrow('ApiKeySecurity');
    expect(apiKeySecurity).toHaveProperty('type', 'apiKey');
    expect(apiKeySecurity).toHaveProperty('name', 'x');
    expect(apiKeySecurity).toHaveProperty('in', 'cookie');

    const oauth2Security = openapi.components.getSecuritySchemaOrThrow(
      'OAuth2Security',
    ) as OAuth2SecurityScheme;
    expect(oauth2Security).toHaveProperty('type', 'oauth2');

    const implicitFlow = oauth2Security.flows.implicit;
    expect(implicitFlow).toHaveProperty('authorizationUrl', 'http://example.com');
    expect(implicitFlow).toHaveProperty('refreshUrl', null);
    expect(implicitFlow).toHaveProperty('scopeCount', 2);
    expect(implicitFlow?.getScopeDescription('read')).toBe('read');
    expect(implicitFlow?.getScopeDescription('write')).toBe('write');

    const passwordFlow = oauth2Security.flows.password;
    expect(passwordFlow).toHaveProperty('tokenUrl', 'http://example.com');
    expect(passwordFlow).toHaveProperty('refreshUrl', null);
    expect(passwordFlow).toHaveProperty('scopeCount', 1);
    expect(passwordFlow?.getScopeDescription('email')).toBe('email');

    const clientCredentialsFlow = oauth2Security.flows.clientCredentials;
    expect(clientCredentialsFlow).toHaveProperty('tokenUrl', 'http://example.com');
    expect(clientCredentialsFlow).toHaveProperty('refreshUrl', null);
    expect(clientCredentialsFlow).toHaveProperty('scopeCount', 1);
    expect(clientCredentialsFlow?.getScopeDescription('show')).toBe('show anything');

    const authorizationCodeFlow = oauth2Security.flows.authorizationCode;
    expect(authorizationCodeFlow).toHaveProperty('authorizationUrl', 'http://example.com');
    expect(authorizationCodeFlow).toHaveProperty('tokenUrl', 'http://example.com');
    expect(authorizationCodeFlow).toHaveProperty('refreshUrl', null);
    expect(authorizationCodeFlow).toHaveProperty('scopeCount', 0);

    const openIdConnectSecurity =
      openapi.components.getSecuritySchemaOrThrow('OpenIdConnectSecurity');
    expect(openIdConnectSecurity).toHaveProperty('type', 'openIdConnect');
    expect(openIdConnectSecurity).toHaveProperty('openIdConnectUrl', 'http://example.com');
  });

  test('throws if encountered a schema with unknown type', () => {
    expect(() => {
      reader.parse({
        ...openapiObjectSkeleton,
        components: {
          securitySchemes: {
            unknown: {
              type: 'unknown' as 'http',
              scheme: 'bearer',
            },
          },
        },
      });
    }).toThrow();
  });
});

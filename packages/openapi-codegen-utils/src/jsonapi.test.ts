import { OpenAPIFactory, OpenAPIWriter } from '@fresha/openapi-model/build/3.0.3';

import {
  setResourceIdSchema,
  createResourceIdSchema,
  setResourceSchema,
  createResourceSchema,
  addResourceAttribute,
  addResourceAttributes,
  addResourceRelationship,
  setDataDocumentSchema,
} from './jsonapi';

const writer = new OpenAPIWriter();

test('setResourceLinkSchema', () => {
  const openapi = OpenAPIFactory.create();

  setResourceIdSchema(openapi.components.setSchema('EmployeeId', 'object'), 'employees');
  setResourceIdSchema(openapi.components.setSchema('GenericResourceId', 'object'));

  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas'], {
    EmployeeId: {
      title: 'EmployeeId',
      type: 'object',
      required: ['type', 'id'],
      properties: {
        type: { type: 'string', enum: ['employees'], minLength: 1 },
        id: { type: 'string', minLength: 1 },
      },
    },
    GenericResourceId: {
      title: 'GenericResourceId',
      type: 'object',
      required: ['type', 'id'],
      properties: {
        type: { type: 'string', minLength: 1 },
        id: { type: 'string', minLength: 1 },
      },
    },
  });
});

test('createResourceIdSchema', () => {
  const openapi = OpenAPIFactory.create();
  const schema = createResourceIdSchema(openapi.components, 'locations');
  openapi.components.setSchemaModel('LocationId', schema);
  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'LocationId']);
});

test('setResourceSchema', () => {
  const openapi = OpenAPIFactory.create();

  setResourceSchema(openapi.components.setSchema('Employee', 'object'), 'employees');

  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'Employee'], {
    title: 'Employee',
    type: 'object',
    required: ['type', 'id', 'attributes'],
    properties: {
      type: { type: 'string', enum: ['employees'], minLength: 1 },
      id: { type: 'string', minLength: 1 },
      attributes: { type: 'object' },
      relationships: { type: 'object' },
    },
  });
});

test('createResourceSchema', () => {
  const openapi = OpenAPIFactory.create();
  const schema = createResourceSchema(openapi.components, 'employees');
  openapi.components.setSchemaModel('Employee', schema);
  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'Employee']);
});

test('addResourceAttribute', () => {
  const openapi = OpenAPIFactory.create();
  const schema = openapi.components.setSchema('Organization', 'object');
  setResourceSchema(schema, 'organizations');

  addResourceAttribute(schema, 'name', { type: 'string', required: true });
  addResourceAttribute(schema, 'createdAt', 'date-time');

  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'Organization'], {
    title: 'Organization',
    type: 'object',
    required: ['type', 'id', 'attributes'],
    properties: {
      type: { type: 'string', enum: ['organizations'], minLength: 1 },
      id: { type: 'string', minLength: 1 },
      attributes: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      relationships: { type: 'object' },
    },
  });
});

test('addResourceAttributes', () => {
  const openapi = OpenAPIFactory.create();
  const schema = openapi.components.setSchema('Organization', 'object');
  setResourceSchema(schema, 'organizations');

  addResourceAttributes(schema, {
    name: { type: 'string', required: true },
    createdAt: 'date-time',
  });

  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'Organization'], {
    title: 'Organization',
    type: 'object',
    required: ['type', 'id', 'attributes'],
    properties: {
      type: { type: 'string', enum: ['organizations'], minLength: 1 },
      id: { type: 'string', minLength: 1 },
      attributes: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      relationships: { type: 'object' },
    },
  });
});

test('addResourceRelationship', () => {
  const openapi = OpenAPIFactory.create();
  const schema = openapi.components.setSchema('Organization', 'object');
  setResourceSchema(schema, 'organizations');

  addResourceRelationship(schema, 'single-optional-shortcut', 'schema1');
  addResourceRelationship(schema, 'single-optional', { type: 'schema2' });
  addResourceRelationship(schema, 'single-required', { type: 'schema3', required: true });
  addResourceRelationship(schema, 'multiple-optional', { type: 'schema4', multiple: true });
  addResourceRelationship(schema, 'multiple-required', {
    type: 'schema5',
    multiple: true,
    required: true,
  });

  expect(writer.write(openapi)).toHaveProperty(
    ['components', 'schemas', 'Organization', 'properties', 'relationships'],
    {
      type: 'object',
      required: ['single-required', 'multiple-required'],
      properties: {
        'single-optional-shortcut': {
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              type: 'object',
              required: ['type', 'id'],
              properties: {
                type: { type: 'string', minLength: 1, enum: ['schema1'] },
                id: { type: 'string', minLength: 1 },
              },
              nullable: true,
            },
          },
        },
        'single-optional': {
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              type: 'object',
              required: ['type', 'id'],
              properties: {
                type: { type: 'string', minLength: 1, enum: ['schema2'] },
                id: { type: 'string', minLength: 1 },
              },
              // nullable: true,
            },
          },
        },
        'single-required': {
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              type: 'object',
              required: ['type', 'id'],
              properties: {
                type: { type: 'string', minLength: 1, enum: ['schema3'] },
                id: { type: 'string', minLength: 1 },
              },
              // nullable: false,
            },
          },
        },
        'multiple-optional': {
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                required: ['type', 'id'],
                properties: {
                  type: { type: 'string', minLength: 1, enum: ['schema4'] },
                  id: { type: 'string', minLength: 1 },
                },
                // nullable: true,
              },
            },
          },
        },
        'multiple-required': {
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                required: ['type', 'id'],
                properties: {
                  type: { type: 'string', minLength: 1, enum: ['schema5'] },
                  id: { type: 'string', minLength: 1 },
                },
                // nullable: false,
              },
            },
          },
        },
      },
    },
  );
});

test('setDataDocumentSchema', () => {
  const openapi = OpenAPIFactory.create();
  const schema = openapi.components.setSchema('DataDocument', 'object');

  setDataDocumentSchema(schema, 'employees');

  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'DataDocument'], {
    title: 'DataDocument',
    type: 'object',
    required: ['data'],
    properties: {
      jsonapi: {
        type: 'object',
        required: ['version'],
        properties: {
          version: { type: 'string', enum: ['1.0'] },
        },
      },
      data: {
        type: 'object',
        required: ['type', 'id', 'attributes'],
        properties: {
          type: {
            type: 'string',
            minLength: 1,
            enum: ['employees'],
          },
          id: {
            type: 'string',
            minLength: 1,
          },
          attributes: {
            type: 'object',
          },
          relationships: {
            type: 'object',
          },
        },
      },
    },
  });
});

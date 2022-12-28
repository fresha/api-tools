import {
  OpenAPIFactory,
  OpenAPIModel,
  OpenAPIWriter,
  SchemaModel,
} from '@fresha/openapi-model/build/3.0.3';

import {
  setResourceIdSchema,
  createResourceIdSchema,
  setResourceSchema,
  createResourceSchema,
  addResourceAttribute,
  addResourceAttributes,
  addResourceRelationship,
  setDataDocumentSchema,
  RelationshipCardinality,
  createDataDocumentSchema,
  createNullSchema,
  addResourceRelationships,
} from './jsonapi';

let openapi: OpenAPIModel;
let writer: OpenAPIWriter;

beforeEach(() => {
  openapi = OpenAPIFactory.create();
  writer = new OpenAPIWriter();
});

test('createNullSchema', () => {
  const nullSchema = createNullSchema(openapi.components);
  expect(openapi.components.getSchema('Null')).toBe(nullSchema);
  expect(nullSchema.isNull());

  const parent = openapi.components.setSchema('Parent', 'object');
  const inlineNullSchema = createNullSchema(parent);
  expect(inlineNullSchema.title).toBe('Null');
  expect(inlineNullSchema.isNull());
});

test('setResourceIdSchema', () => {
  setResourceIdSchema(openapi.components.setSchema('EmployeeResourceID', 'object'), 'employees');
  setResourceIdSchema(openapi.components.setSchema('GenericResourceID', 'object'));

  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas'], {
    EmployeeResourceID: {
      title: 'EmployeeResourceID',
      type: 'object',
      required: ['type', 'id'],
      properties: {
        type: { type: 'string', enum: ['employees'], minLength: 1 },
        id: { type: 'string', minLength: 1 },
      },
    },
    GenericResourceID: {
      title: 'GenericResourceID',
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
  const schema = createResourceIdSchema(openapi.components, 'locations');
  openapi.components.setSchemaModel('LocationId', schema);
  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'LocationId']);
});

test('setResourceSchema', () => {
  setResourceSchema(openapi.components.setSchema('Employee'), 'employees');

  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'Employee'], {
    title: 'EmployeeResource',
    allOf: [
      {
        title: 'EmployeeResourceID',
        type: 'object',
        required: ['type', 'id'],
        properties: {
          type: { type: 'string', enum: ['employees'], minLength: 1 },
          id: { type: 'string', minLength: 1 },
        },
      },
      {
        type: 'object',
        required: ['attributes'],
        properties: {
          attributes: { type: 'object' },
          relationships: { type: 'object' },
        },
      },
    ],
  });
});

test('createResourceSchema', () => {
  const schema = createResourceSchema(openapi.components, 'employees');
  openapi.components.setSchemaModel('Employee', schema);
  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'Employee']);
});

test('addResourceAttribute', () => {
  const schema = openapi.components.setSchema('Organization');
  setResourceSchema(schema, 'organizations');

  addResourceAttribute(schema, 'name', { type: 'string', required: true });
  addResourceAttribute(schema, 'createdAt', 'date-time');

  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'Organization'], {
    title: 'OrganizationResource',
    allOf: [
      {
        title: 'OrganizationResourceID',
        type: 'object',
        required: ['type', 'id'],
        properties: {
          type: { type: 'string', enum: ['organizations'], minLength: 1 },
          id: { type: 'string', minLength: 1 },
        },
      },
      {
        type: 'object',
        required: ['attributes'],
        properties: {
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
      },
    ],
  });
});

test('addResourceAttributes', () => {
  const schema = openapi.components.setSchema('Organization');
  setResourceSchema(schema, 'organizations');

  addResourceAttributes(schema, {
    name: { type: 'string', required: true },
    createdAt: 'date-time',
  });

  expect(writer.write(openapi)).toHaveProperty(['components', 'schemas', 'Organization'], {
    title: 'OrganizationResource',
    allOf: [
      {
        title: 'OrganizationResourceID',
        type: 'object',
        required: ['type', 'id'],
        properties: {
          type: { type: 'string', enum: ['organizations'], minLength: 1 },
          id: { type: 'string', minLength: 1 },
        },
      },
      {
        type: 'object',
        required: ['attributes'],
        properties: {
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
      },
    ],
  });
});

describe('addResourceRelationship', () => {
  let schema: SchemaModel;

  beforeEach(() => {
    schema = openapi.components.setSchema('Organization');
    setResourceSchema(schema, 'organizations');
  });

  test('optionality', () => {
    addResourceRelationship(schema, 'address1', 'addresses', RelationshipCardinality.One);
    addResourceRelationship(schema, 'address2', 'addresses', RelationshipCardinality.One, false);

    expect(writer.write(openapi)).toHaveProperty(
      [
        'components',
        'schemas',
        'Organization',
        'allOf',
        '1',
        'properties',
        'relationships',
        'required',
      ],
      ['address1'],
    );
  });

  test('cardinality', () => {
    addResourceRelationship(schema, 'address', 'addresses', RelationshipCardinality.One);
    addResourceRelationship(schema, 'head', 'people', RelationshipCardinality.ZeroOrOne);
    addResourceRelationship(schema, 'members', 'people', RelationshipCardinality.Many);

    const data = writer.write(openapi);

    const commonPathPrefix = [
      'components',
      'schemas',
      'Organization',
      'allOf',
      '1',
      'properties',
      'relationships',
      'properties',
    ];

    expect(data).toHaveProperty(commonPathPrefix.concat('address', 'properties', 'data'), {
      type: 'object',
      title: 'AddressResourceID',
      required: ['type', 'id'],
      properties: {
        type: { type: 'string', minLength: 1, enum: ['addresses'] },
        id: { type: 'string', minLength: 1 },
      },
    });

    expect(data).toHaveProperty(commonPathPrefix.concat('head', 'properties', 'data'), {
      allOf: [
        {
          title: 'PersonResourceID',
          type: 'object',
          required: ['type', 'id'],
          properties: {
            type: { type: 'string', minLength: 1, enum: ['people'] },
            id: { type: 'string', minLength: 1 },
          },
        },
        {
          enum: [null],
        },
      ],
    });

    expect(data).toHaveProperty(commonPathPrefix.concat('members', 'properties', 'data'), {
      type: 'array',
      items: {
        type: 'object',
        title: 'PersonResourceID',
        required: ['type', 'id'],
        properties: {
          type: { type: 'string', minLength: 1, enum: ['people'] },
          id: { type: 'string', minLength: 1 },
        },
      },
    });
  });
});

test('addResourceRelationships', () => {
  const openapi1 = OpenAPIFactory.create();
  const schema1 = openapi1.components.setSchema('EmployeeResource');
  setResourceSchema(schema1, 'employees');
  addResourceRelationship(schema1, 'zeroOrOne', 'people', RelationshipCardinality.ZeroOrOne, false);
  addResourceRelationship(schema1, 'one', 'people', RelationshipCardinality.One);
  addResourceRelationship(schema1, 'many', 'colleagues', RelationshipCardinality.Many, false);
  const json1 = writer.write(openapi1);

  const openapi2 = OpenAPIFactory.create();
  const schema2 = openapi2.components.setSchema('EmployeeResource');
  setResourceSchema(schema2, 'employees');
  addResourceRelationships(schema2, {
    zeroOrOne: {
      resourceType: 'people',
      cardinality: RelationshipCardinality.ZeroOrOne,
      required: false,
    },
    one: { resourceType: 'people', cardinality: RelationshipCardinality.One, required: true },
    many: {
      resourceType: 'colleagues',
      cardinality: RelationshipCardinality.Many,
      required: false,
    },
  });
  const json2 = writer.write(openapi2);

  expect(json1).toStrictEqual(json2);
});

test('setDataDocumentSchema', () => {
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
        title: 'EmployeeResource',
        allOf: [
          {
            title: 'EmployeeResourceID',
            type: 'object',
            required: ['type', 'id'],
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
            },
          },
          {
            type: 'object',
            required: ['attributes'],
            properties: {
              attributes: {
                type: 'object',
              },
              relationships: {
                type: 'object',
              },
            },
          },
        ],
      },
    },
  });
});

test('createDataDocumentSchema', () => {
  const openapi1 = OpenAPIFactory.create();
  const schema1 = openapi1.components.setSchema('DataDocument', 'object');
  setDataDocumentSchema(schema1, 'employees');
  const json1 = writer.write(openapi1);

  const openapi2 = OpenAPIFactory.create();
  const schema2 = createDataDocumentSchema(openapi2.components, 'employees');
  schema2.title = 'DataDocument';
  openapi2.components.setSchemaModel('DataDocument', schema2);
  setDataDocumentSchema(schema2, 'employees');
  const json2 = writer.write(openapi2);

  expect(json1).toStrictEqual(json2);
});

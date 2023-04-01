import {
  addResourceRelationship,
  MEDIA_TYPE_JSON_API,
  RelationshipCardinality,
  setDataDocumentSchema,
} from '@fresha/openapi-codegen-utils';

import { createTestContext } from '../testHelpers';

import { Controller } from './Controller';

test('parameter-less action, minimal implementation', () => {
  const context = createTestContext('awesome_web');

  const pathItem = context.openapi.setPathItem('/employees/:id/tasks');
  const operation = pathItem.addOperation('post');
  operation.operationId = 'createEmployee';

  const controller = new Controller(context, '/pracownicy', 'AwesoneWeb.EmployeesController');
  controller.collectData(pathItem);
  controller.generateCode();

  expect(controller.sourceFile.getText()).toMatchSnapshot();
});

test('ID parameter leads to generating parse_XXXX_param function, as well as error handling', () => {
  const context = createTestContext('awesome_web');

  const pathItem = context.openapi.setPathItem('/employees/:id/tasks');
  const operation = pathItem.addOperation('get');
  operation.operationId = 'readEmployee';
  operation.addParameter('id', 'path').setSchema('string');

  const controller = new Controller(context, 'employees', 'EmployeeController');
  controller.collectData(pathItem);
  controller.generateCode();

  expect(controller.sourceFile.getText()).toMatchSnapshot();
});

test('request body leads to generating parse_XXXX_conn function, as well as error handling', () => {
  const context = createTestContext('awesome_web');

  const pathItem = context.openapi.setPathItem('/profile');
  const requestBodySchema = pathItem
    .addOperation('put')
    .setRequestBody()
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema('object');
  setDataDocumentSchema(requestBodySchema, 'profile-settings');
  const attributesSchema = requestBodySchema
    .getPropertyOrThrow('data')
    .getPropertyDeepOrThrow('attributes');
  attributesSchema.setProperties({
    name: { type: 'string', required: true },
    age: { type: 'integer', required: true, minimum: 18, maximum: 200 },
    weight: 'float',
    birthDate: 'date',
    score: 'number',
    gender: { type: 'string', required: true, enum: ['male', 'female', 'other'] },
    num1: { type: 'number', minimum: 10, exclusiveMinimum: true },
    num2: { type: 'number', minimum: 10, exclusiveMinimum: false },
    num3: { type: 'number', maximum: 20, exclusiveMaximum: true },
    num4: { type: 'number', maximum: 20, exclusiveMaximum: false },
    int1: { type: 'integer', minimum: 10, exclusiveMinimum: true },
    int2: { type: 'integer', minimum: 10, exclusiveMinimum: false },
    int3: { type: 'integer', maximum: 20, exclusiveMaximum: true },
    int4: { type: 'integer', maximum: 20, exclusiveMaximum: false },
  });

  const resourceSchema = requestBodySchema.getPropertyOrThrow('data');
  addResourceRelationship(resourceSchema, 'location', 'locations');
  addResourceRelationship(
    resourceSchema,
    'employee',
    'employees',
    RelationshipCardinality.One,
    false,
  );

  const controller = new Controller(context, '/profile', 'AwesomeWeb.ProfileController');
  controller.collectData(pathItem);
  controller.generateCode();

  // TODO test
  // :decimal
  // :email
  // trim options for :string
  expect(controller.sourceFile.getText()).toMatchSnapshot();
});

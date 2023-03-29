import assert from 'assert';

import { buildEmployeeSchemasForTesting } from '@fresha/openapi-codegen-test-utils';
import {
  addResourceAttributes,
  getOperationDefaultResponseSchemaOrThrow,
  MEDIA_TYPE_JSON_API,
  setResourceSchema,
} from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OperationModel } from '@fresha/openapi-model/build/3.0.3';

import { createActionTestContext } from '../testHelpers';

import { NamedType } from './NamedType';
import { ResourceType } from './ResourceType';

const createResourceType = (
  operation: OperationModel,
  name: string,
  isRequestBody = false,
): ResourceType => {
  const context = createActionTestContext(operation, '/src/index.ts');
  const schema = getOperationDefaultResponseSchemaOrThrow(operation, true);
  assert(schema);
  return new ResourceType(context, name, schema, isRequestBody, true);
};

let operation = OpenAPIFactory.create().setPathItem('/hello').addOperation('get');
let namedTypes = new Map<string, NamedType>();
let generatedTypes = new Set<string>();

beforeEach(() => {
  operation = OpenAPIFactory.create().setPathItem('/hello').addOperation('get');
  namedTypes = new Map<string, NamedType>();
  generatedTypes = new Set<string>();
});

test('simple, client resource', () => {
  operation.setDefaultResponse('test').setMediaType(MEDIA_TYPE_JSON_API).setSchema(null);

  const resourceType = createResourceType(operation, 'SimpleResource', true);

  namedTypes.set(resourceType.name, resourceType);

  resourceType.collectData(namedTypes);
  resourceType.generateCode(generatedTypes);

  expect(
    resourceType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
  ).toMatchSnapshot('src/types.ts');
});

test('attributes', () => {
  const schema = operation
    .setDefaultResponse('test')
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema(null);
  setResourceSchema(schema, 'hello');
  addResourceAttributes(schema, {
    name: { type: 'string', required: true },
    age: { type: 'integer', nullable: true, required: false },
    gender: { type: 'string', nullable: true, required: true, enum: ['male', 'female', 'other'] },
    active: 'boolean',
  });

  const resourceType = createResourceType(operation, 'HelloResource');

  namedTypes.set(resourceType.name, resourceType);

  resourceType.collectData(namedTypes);
  resourceType.generateCode(generatedTypes);

  expect(
    resourceType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
  ).toMatchSnapshot();
});

test('relationships', () => {
  buildEmployeeSchemasForTesting(operation.root);

  const employee = operation.root.components.getSchemaOrThrow('EmployeeResource');
  employee.title = 'Employee resource';
  employee.description = `
    This resource contains information about a single employee.
    It also links to other related resources.
  `
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => !!line.length)
    .join('\n');

  // remove attributes to unclutter output
  employee.getPropertyDeepOrThrow('attributes').clearProperties();

  operation.setDefaultResponse('test').setMediaType(MEDIA_TYPE_JSON_API).setSchema(employee);

  const resourceType = createResourceType(operation, 'HelloResource');

  namedTypes.set(resourceType.name, resourceType);

  resourceType.collectData(namedTypes);
  resourceType.generateCode(generatedTypes);

  expect(
    resourceType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
  ).toMatchSnapshot('src/types.ts');
});

import { buildEmployeeSchemasForTesting } from '@fresha/openapi-codegen-test-utils';
import {
  addResourceAttributes,
  addResourceRelationships,
  MEDIA_TYPE_JSON_API,
  RelationshipCardinality,
  setResourceSchema,
} from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OpenAPIModel, OperationModel } from '@fresha/openapi-model/build/3.0.3';

import { ActionContext } from '../context';
import { createActionTestContext } from '../testHelpers';

import { ActionFunc } from './ActionFunc';

import type { NamedType } from './NamedType';

const createAction = (operation: OperationModel, filePath = 'src/index.ts'): ActionFunc => {
  const context: ActionContext = {
    ...createActionTestContext(operation, filePath),
    clientNaming: 'camel',
  };
  return new ActionFunc(context);
};

let openapi: OpenAPIModel;

beforeEach(() => {
  openapi = OpenAPIFactory.create();
});

test('simple test', () => {
  buildEmployeeSchemasForTesting(openapi);

  openapi.components.setSecuritySchema('the_auth', 'apiKey');

  const operation = openapi.setPathItem('/employees').addOperation('get');
  operation.operationId = 'readEmployeeList';
  operation.summary = 'Reads employee list';
  operation.description = `
    This operation reads a list of employee resources, and returns them as a JSON:API
    document. Besides employees, it includes resources associated with employees, like
    addresses and **departments**.
  `
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => !!line.length)
    .join('\n');

  const paramOffset = operation.addParameter('offset', 'query');
  paramOffset.required = true;
  paramOffset.setSchema('number');
  paramOffset.description = 'Index of the first employee to retrieve';

  const paramLimit = operation.addParameter('limit', 'query');
  paramLimit.required = false;
  paramLimit.setSchema('number');
  paramLimit.description = 'Maximal number of employee resources to retrieve';

  operation
    .setResponse(200, 'returns a list of employees')
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema('object')
    .setProperty('data', 'array')
    .setItems(openapi.components.getSchemaOrThrow('EmployeeResource'));
  operation.addSecurityRequirement().addSchema('the_auth');

  const namedTypes = new Map<string, NamedType>();

  const action = createAction(operation);
  action.collectData(namedTypes);
  action.generateCode();

  const generatedTypes = new Set<string>();
  for (const namedType of namedTypes.values()) {
    namedType.generateCode(generatedTypes);
  }

  expect(action.context.project.getSourceFileOrThrow('src/types.ts').getText()).toMatchSnapshot(
    'src/types.ts',
  );
  expect(action.context.project.getSourceFileOrThrow('src/index.ts').getText()).toMatchSnapshot(
    'src/index.ts',
  );
});

test('specific naming convention for client library', () => {
  // construct a resource with kebab-case attributes
  const employee = openapi.components.setSchema('EmployeeResource');
  setResourceSchema(employee, 'employees');
  addResourceAttributes(employee, {
    'old-name': { type: 'string', required: true },
    'new-name': { type: 'string', required: true },
    age: { type: 'number', nullable: true },
    'is-active': { type: 'boolean', nullable: false },
  });
  addResourceRelationships(employee, {
    'direct-manager': { resourceType: 'employees', cardinality: RelationshipCardinality.One },
  });

  openapi.components.setSecuritySchema('the_auth', 'apiKey');

  const operation = openapi.setPathItem('/employees').addOperation('patch');
  operation.operationId = 'readEmployeeList';

  operation
    .setResponse(200, 'returns a list of employees')
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema('object')
    .setProperty('data', 'array')
    .setItems(openapi.components.getSchemaOrThrow('EmployeeResource'));
  operation.addSecurityRequirement().addSchema('the_auth');

  const namedTypes = new Map<string, NamedType>();

  // override default values for api/client naming conventions
  const context: ActionContext = {
    ...createActionTestContext(operation, 'src/index.ts'),
    apiNaming: 'kebab',
    clientNaming: 'camel',
  };
  const action = new ActionFunc(context);

  action.collectData(namedTypes);
  action.generateCode();

  const generatedTypes = new Set<string>();
  for (const namedType of namedTypes.values()) {
    namedType.generateCode(generatedTypes);
  }

  expect(action.context.project.getSourceFileOrThrow('src/types.ts').getText()).toMatchSnapshot(
    'src/types.ts',
  );
  expect(action.context.project.getSourceFileOrThrow('src/index.ts').getText()).toMatchSnapshot(
    'src/index.ts',
  );
});

test('action returns raw response', () => {
  const schema = openapi.components.setSchema('EmployeeResource');
  setResourceSchema(schema, 'employees');

  const operation = openapi.setPathItem('/employees').addOperation('get');
  operation.operationId = 'readEmployeeList';
  operation
    .setResponse(200, 'returns a list of employees')
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema('object')
    .setProperty('data', 'array')
    .setItems(schema);
  operation.setExtension('fresha-codegen', {
    'client-fetch': {
      return: 'response',
    },
  });

  const namedTypes = new Map<string, NamedType>();

  const action = createAction(operation);
  action.collectData(namedTypes);
  action.generateCode();

  const generatedTypes = new Set<string>();
  for (const namedType of namedTypes.values()) {
    namedType.generateCode(generatedTypes);
  }

  expect(action.context.project.getSourceFileOrThrow('src/types.ts').getText()).toMatchSnapshot(
    'src/types.ts',
  );
  expect(action.context.project.getSourceFileOrThrow('src/index.ts').getText()).toMatchSnapshot(
    'src/index.ts',
  );
});

test('test optional header parameters', () => {
  buildEmployeeSchemasForTesting(openapi);

  openapi.components.setSecuritySchema('the_auth', 'apiKey');

  const operation = openapi.setPathItem('/test-endpoint').addOperation('get');
  operation.operationId = 'test';
  operation.summary = 'operation with an optional header';
  operation.description = `This operation has an optional header parameter`;

  const headerParameter = operation.addParameter('Optional-Header-Parameter', 'header');
  headerParameter.required = false;
  headerParameter.setSchema('string');
  headerParameter.description = 'optional header parameter';
  operation.setResponse(200, 'returns a success').setMediaType(MEDIA_TYPE_JSON_API);

  operation.addSecurityRequirement().addSchema('the_auth');

  const namedTypes = new Map<string, NamedType>();

  const action = createAction(operation);
  action.collectData(namedTypes);
  action.generateCode();

  const generatedTypes = new Set<string>();
  for (const namedType of namedTypes.values()) {
    namedType.generateCode(generatedTypes);
  }

  expect(action.context.project.getSourceFileOrThrow('src/index.ts').getText()).toMatchSnapshot(
    'src/index.ts',
  );
});

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

import '@fresha/openapi-codegen-test-utils/build/matchers';

const createResourceType = (
  operation: OperationModel,
  name: string,
  isRequestBody = false,
): ResourceType => {
  const context = createActionTestContext(operation, '/src/index.ts');
  const schema = getOperationDefaultResponseSchemaOrThrow(operation, true);
  assert(schema);
  return new ResourceType(context, name, schema, isRequestBody);
};

let operation = OpenAPIFactory.create().setPathItem('/hello').setOperation('get');
let namedTypes = new Map<string, NamedType>();
let generatedTypes = new Set<string>();

beforeEach(() => {
  operation = OpenAPIFactory.create().setPathItem('/hello').setOperation('get');
  namedTypes = new Map<string, NamedType>();
  generatedTypes = new Set<string>();
});

test('simple, client resource', () => {
  operation.setDefaultResponse('test').setContent(MEDIA_TYPE_JSON_API).setSchema(null);

  const resourceType = createResourceType(operation, 'SimpleResource', true);

  namedTypes.set(resourceType.name, resourceType);

  resourceType.collectData(namedTypes);
  resourceType.generateCode(generatedTypes);

  expect(resourceType.context.project.getSourceFileOrThrow('src/types.ts'))
    .toHaveFormattedTypeScriptText(`
    import type { JSONAPIClientResource } from '@fresha/api-tools-core';

    export type SimpleResource = JSONAPIClientResource;
  `);
});

test('attributes', () => {
  const schema = operation
    .setDefaultResponse('test')
    .setContent(MEDIA_TYPE_JSON_API)
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

  expect(resourceType.context.project.getSourceFile('src/types.ts')).toHaveFormattedTypeScriptText(`
    import type { JSONAPIServerResource } from '@fresha/api-tools-core';

    export type HelloResource = JSONAPIServerResource<
      'hello',
      {
        name: string;
        age?: number | null;
        gender: 'male' | 'female' | 'other' | null;
        active?: boolean;
      }
    >;
  `);
});

test('relationships', () => {
  buildEmployeeSchemasForTesting(operation.root);

  const employee = operation.root.components.getSchemaOrThrow('EmployeeResource');

  // remove attributes to unclutter output
  employee.getPropertyDeepOrThrow('attributes').clearProperties();

  const mediaType = operation.setDefaultResponse('test').setContent(MEDIA_TYPE_JSON_API);
  mediaType.schema = employee;

  const resourceType = createResourceType(operation, 'HelloResource');

  namedTypes.set(resourceType.name, resourceType);

  resourceType.collectData(namedTypes);
  resourceType.generateCode(generatedTypes);

  expect(resourceType.context.project.getSourceFile('src/types.ts')).toHaveFormattedTypeScriptText(`
    import type {
      JSONAPIServerResource,
      JSONAPIResourceRelationship1,
      JSONAPIResourceRelationship0,
      JSONAPIResourceRelationshipN,
    } from '@fresha/api-tools-core';

    export type HelloResource = JSONAPIServerResource<
      'employees',
      {},
      {
        manager: JSONAPIResourceRelationship1<'employees'>;
        buddy: JSONAPIResourceRelationship0<'employees'>;
        subordinates: JSONAPIResourceRelationshipN<'employees'>;
      }
    >;
  `);
});

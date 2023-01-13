import { buildEmployeeSchemasForTesting } from '@fresha/openapi-codegen-test-utils';
import { MEDIA_TYPE_JSON_API, setResourceSchema } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OperationModel } from '@fresha/openapi-model/build/3.0.3';

import '@fresha/openapi-codegen-test-utils/build/matchers';

import { createActionTestContext } from '../testHelpers';

import type { NamedType } from './NamedType';

import { ActionFunc } from './ActionFunc';

const createAction = (operation: OperationModel, filePath = 'src/index.ts'): ActionFunc => {
  const context = createActionTestContext(operation, filePath);
  return new ActionFunc(context);
};

test('simple test', () => {
  const openapi = OpenAPIFactory.create();
  buildEmployeeSchemasForTesting(openapi);

  openapi.components.setSecuritySchema('the_auth', 'apiKey');

  const operation = openapi.setPathItem('/employees').setOperation('get');
  operation.operationId = 'readEmployeeList';
  operation
    .setResponse(200, 'returns a list of employees')
    .setContent(MEDIA_TYPE_JSON_API)
    .setSchema('object')
    .setProperty('data', 'array')
    .setItems(openapi.components.getSchemaOrThrow('EmployeeResource'));
  operation.addSecurityRequirement().addScopes('the_auth');

  const namedTypes = new Map<string, NamedType>();
  const generatedTypes = new Set<string>();

  const action = createAction(operation);
  action.collectData(namedTypes);
  action.generateCode(generatedTypes);

  expect(action.context.project.getSourceFile('src/index.ts')).toHaveFormattedTypeScriptText(`
    import {
      COMMON_HEADERS,
      makeUrl,
      callJsonApi,
      toString,
      authorizeRequest,
    } from './utils';
    import type {
      JSONAPIServerResource,
      JSONAPIResourceRelationship1,
      JSONAPIResourceRelationship0,
      JSONAPIResourceRelationshipN,
      JSONAPIDataDocument,
    } from "@fresha/api-tools-core";

    export type EmployeeResource = JSONAPIServerResource<
      'employees',
      {
        name: string;
        age?: number | null;
        gender?: 'male' | 'female' | 'other' | null;
        active?: boolean;
      },
      {
        manager: JSONAPIResourceRelationship1<'employees'>;
        buddy: JSONAPIResourceRelationship0<'employees'>;
        subordinates: JSONAPIResourceRelationshipN<'employees'>;
      }
    >;

    export type ReadEmployeeListResponse = JSONAPIDataDocument<EmployeeResource[]>;

    export async function readEmployeeList(): Promise<ReadEmployeeListResponse> {
      const url = makeUrl(\`/employees\`);

      const request = {
        headers: COMMON_HEADERS,
      };

      authorizeRequest(request);

      const response = await callJsonApi(url, request);

      return response as unknown as ReadEmployeeListResponse;
    }
  `);
});

test('action returns raw response', () => {
  const openapi = OpenAPIFactory.create();

  const schema = openapi.components.setSchema('EmployeeResource');
  setResourceSchema(schema, 'employees');

  const operation = openapi.setPathItem('/employees').setOperation('get');
  operation.operationId = 'readEmployeeList';
  operation
    .setResponse(200, 'returns a list of employees')
    .setContent(MEDIA_TYPE_JSON_API)
    .setSchema('object')
    .setProperty('data', 'array')
    .setItems(schema);
  operation.setExtension('fresha-codegen', {
    'client-fetch': {
      return: 'response',
    },
  });

  const namedTypes = new Map<string, NamedType>();
  const generatedTypes = new Set<string>();

  const action = createAction(operation);
  action.collectData(namedTypes);
  action.generateCode(generatedTypes);

  expect(action.context.project.getSourceFile('src/index.ts')).toHaveFormattedTypeScriptText(`
    import {
      COMMON_HEADERS,
      makeUrl,
      callApi,
      toString,
    } from './utils';
    import type {
      JSONAPIServerResource,
      JSONAPIDataDocument,
    } from "@fresha/api-tools-core";

    export type EmployeeResource = JSONAPIServerResource<'employees'>;

    export type ReadEmployeeListResponse = JSONAPIDataDocument<EmployeeResource[]>;

    export async function readEmployeeList(): Promise<Response> {
      const url = makeUrl(\`/employees\`);

      const request = {
        headers: COMMON_HEADERS,
      };

      const response = await callApi(url, request);

      return response;
    }
  `);
});

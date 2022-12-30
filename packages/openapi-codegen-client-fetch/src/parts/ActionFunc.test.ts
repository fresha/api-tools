import { buildEmployeeSchemasForTesting } from '@fresha/openapi-codegen-test-utils';
import { MEDIA_TYPE_JSON_API } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OperationModel } from '@fresha/openapi-model/build/3.0.3';

import '@fresha/openapi-codegen-test-utils/build/matchers';

import { createActionTestContext } from '../testHelpers';

import { ActionFunc } from './ActionFunc';

import type { NamedType } from './NamedType';

const createAction = (operation: OperationModel, filePath = 'src/index.ts'): ActionFunc => {
  const context = createActionTestContext(operation, filePath);
  return new ActionFunc(context);
};

test('simple test', () => {
  const openapi = OpenAPIFactory.create();
  buildEmployeeSchemasForTesting(openapi);

  const operation = openapi.setPathItem('/employees').setOperation('get');
  operation.operationId = 'readEmployeeList';
  operation
    .setResponse(200, 'returns a list of employees')
    .setContent(MEDIA_TYPE_JSON_API)
    .setSchema('object')
    .setProperty('data', 'array').items = openapi.components.getSchemaOrThrow('EmployeeResource');

  const namedTypes = new Map<string, NamedType>();
  const generatedTypes = new Set<string>();

  const action = createAction(operation);
  action.collectData(namedTypes);
  action.generateCode(generatedTypes);

  expect(action.context.project.getSourceFile('src/index.ts')).toHaveFormattedTypeScriptText(`
    import {
      COMMON_HEADERS,
      authorizeRequest,
      makeUrl,
      makeCall,
      toString,
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

      const response = await makeCall(url, request);

      return response as unknown as ReadEmployeeListResponse;
    }
  `);
});

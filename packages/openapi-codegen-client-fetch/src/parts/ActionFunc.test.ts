import { buildEmployeeSchemasForTesting } from '@fresha/openapi-codegen-test-utils';
import {
  addResourceAttributes,
  addResourceRelationships,
  MEDIA_TYPE_JSON_API,
  RelationshipCardinality,
  setResourceSchema,
} from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OperationModel, SchemaFactory } from '@fresha/openapi-model/build/3.0.3';

import '@fresha/openapi-codegen-test-utils/build/matchers';

import { ActionContext } from '../context';
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

  openapi.components.setSecuritySchema('the_auth', 'apiKey');

  const operation = openapi.setPathItem('/employees').setOperation('get');
  operation.operationId = 'readEmployeeList';

  const paramOffset = operation.addParameter('offset', 'query');
  paramOffset.required = true;
  paramOffset.schema = SchemaFactory.create(paramOffset, 'number');

  const paramLimit = operation.addParameter('limit', 'query');
  paramLimit.required = false;
  paramLimit.schema = SchemaFactory.create(paramLimit, 'number');

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
      addQueryParam,
      authorizeRequest,
      ExtraCallParams,
      applyExtraParams,
      dispatchSuccess,
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

    export async function readEmployeeList(
      params: {
        offset: number,
        limit?: number,
      },
      extraParams?: ExtraCallParams,
    ): Promise<ReadEmployeeListResponse> {
      const url = makeUrl(\`/employees\`);
      addQueryParam(url, 'offset', params.offset);
      addQueryParam(url, 'limit', params.limit);

      const request = {
        headers: COMMON_HEADERS,
      };

      authorizeRequest(request, extraParams);

      applyExtraParams(request, extraParams);

      const response = await callJsonApi(url, request);

      dispatchSuccess('readEmployeeList', params, response);

      return response as unknown as ReadEmployeeListResponse;
    }
  `);
});

test('specific naming convention for client library', () => {
  const openapi = OpenAPIFactory.create();

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

  const operation = openapi.setPathItem('/employees').setOperation('patch');
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

  // override default values for api/client naming conventions
  const context: ActionContext = {
    ...createActionTestContext(operation, 'src/index.ts'),
    apiNaming: 'kebab',
    clientNaming: 'camel',
  };
  const action = new ActionFunc(context);

  action.collectData(namedTypes);
  action.generateCode(generatedTypes);

  expect(action.context.project.getSourceFile('src/index.ts')).toHaveFormattedTypeScriptText(`
    import {
      COMMON_HEADERS,
      makeUrl,
      callJsonApi,
      authorizeRequest,
      ExtraCallParams,
      applyExtraParams,
      dispatchSuccess,
    } from './utils';
    import {
      JSONAPIServerResource,
      JSONAPIResourceRelationship1,
      JSONAPIDataDocument,
      camelCaseDeep,
    } from "@fresha/api-tools-core";

    export type EmployeeResource = JSONAPIServerResource<
      'employees',
      {
        oldName: string;
        newName: string;
        age?: number | null;
        isActive?: boolean;
      },
      {
        directManager: JSONAPIResourceRelationship1<'employees'>;
      }
    >;

    export type ReadEmployeeListResponse = JSONAPIDataDocument<EmployeeResource[]>;

    export async function readEmployeeList(
      extraParams?: ExtraCallParams,
    ): Promise<ReadEmployeeListResponse> {
      const url = makeUrl(\`/employees\`);

      const request = {
        method: 'PATCH',
        headers: COMMON_HEADERS,
      };

      authorizeRequest(request, extraParams);

      applyExtraParams(request, extraParams);

      let response = await callJsonApi(url, request);

      response = camelCaseDeep(response);

      dispatchSuccess('readEmployeeList', undefined, response);

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
      ExtraCallParams,
      applyExtraParams
    } from './utils';
    import type {
      JSONAPIServerResource,
      JSONAPIDataDocument,
    } from "@fresha/api-tools-core";

    export type EmployeeResource = JSONAPIServerResource<'employees'>;

    export type ReadEmployeeListResponse = JSONAPIDataDocument<EmployeeResource[]>;

    export async function readEmployeeList(
      extraParams?: ExtraCallParams,
    ): Promise<Response> {
      const url = makeUrl(\`/employees\`);

      const request = {
        headers: COMMON_HEADERS,
      };

      applyExtraParams(request, extraParams);

      const response = await callApi(url, request);

      return response;
    }
  `);
});

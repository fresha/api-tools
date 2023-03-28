import { buildEmployeeSchemasForTesting } from '@fresha/openapi-codegen-test-utils';
import {
  addResourceAttributes,
  addResourceRelationships,
  MEDIA_TYPE_JSON_API,
  RelationshipCardinality,
  setResourceSchema,
} from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OperationModel } from '@fresha/openapi-model/build/3.0.3';

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

  expect(action.context.project.getSourceFile('src/types.ts')).toHaveFormattedTypeScriptText(`
    import type {
      JSONAPIServerResource,
      JSONAPIResourceRelationship1,
      JSONAPIResourceRelationship0,
      JSONAPIResourceRelationshipN,
      JSONAPIDataDocument,
    } from "@fresha/api-tools-core";

    /**
     * EmployeeResource
     *
     * Attributes:
     * -  name
     * -  age
     * -  gender
     * -  active
     *
     * Relationships:
     * -  manager relationship to the 'employees' resource
     * -  buddy relationship to the 'employees' resource
     * -  subordinates relationship to the 'employees' resource
     *
     */
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

    /**
     * This is a response resource
     *
     * Primary data resources:
     *  - EmployeeResource
     *
     */
    export type ReadEmployeeListResponse = JSONAPIDataDocument<EmployeeResource[]>;
  `);

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
      transformResponse,
    } from './utils';
    import type { ReadEmployeeListResponse } from './types';

    /**
     * Reads employee list
     *
     * This operation reads a list of employee resources, and returns them as a JSON:API
     * document. Besides employees, it includes resources associated with employees, like
     * addresses and **departments**.
     *
     * @param params call parameters
     * @param params.offset Index of the first employee to retrieve
     * @param [params.limit] Maximal number of employee resources to retrieve
     *
     * @param [extraParams] additional parameters
     * @param [extraParams.authCookieName] name of the authorization cookie for this request
     * @param [extraParams.authCookie] value of the authorization cookie for this request
     * @param [extraParams.xForwardedFor] sends X-Forwarded-For header with specified value
     * @param [extraParams.xForwardedHost] sends X-Forwarded-Host header with specified value
     * @param [extraParams.xForwardedProto] sends X-Forwarded-Proto header with specified value
     */
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

      const headers = {...COMMON_HEADERS};

      const request = {
        headers,
      };

      authorizeRequest(request, extraParams);

      applyExtraParams(request, extraParams);

      const response = await callJsonApi(url, request);

      dispatchSuccess('readEmployeeList', params, response);

      return transformResponse<ReadEmployeeListResponse>('readEmployeeList', response);
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

  expect(action.context.project.getSourceFile('src/types.ts')).toHaveFormattedTypeScriptText(`
    import type {
      JSONAPIServerResource,
      JSONAPIResourceRelationship1,
      JSONAPIDataDocument,
    } from "@fresha/api-tools-core";

    /**
     * EmployeeResource
     *
     * Attributes:
     * -  old-name
     * -  new-name
     * -  age
     * -  is-active
     *
     * Relationships:
     * -  direct-manager relationship to the 'employees' resource
     *
     */
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

    /**
     * This is a response resource
     *
     * Primary data resources:
     *  - EmployeeResource
     *
     */
    export type ReadEmployeeListResponse = JSONAPIDataDocument<EmployeeResource[]>;
  `);

  expect(action.context.project.getSourceFile('src/index.ts')).toHaveFormattedTypeScriptText(`
    import {
      COMMON_HEADERS,
      makeUrl,
      callJsonApi,
      authorizeRequest,
      ExtraCallParams,
      applyExtraParams,
      dispatchSuccess,
      transformResponse,
    } from './utils';
    import type { ReadEmployeeListResponse } from './types';
    import { camelCaseDeep } from '@fresha/api-tools-core';

    /**
     * @param [extraParams] additional parameters
     * @param [extraParams.authCookieName] name of the authorization cookie for this request
     * @param [extraParams.authCookie] value of the authorization cookie for this request
     * @param [extraParams.xForwardedFor] sends X-Forwarded-For header with specified value
     * @param [extraParams.xForwardedHost] sends X-Forwarded-Host header with specified value
     * @param [extraParams.xForwardedProto] sends X-Forwarded-Proto header with specified value
     */
    export async function readEmployeeList(
      extraParams?: ExtraCallParams,
    ): Promise<ReadEmployeeListResponse> {
      const url = makeUrl(\`/employees\`);

      const headers = {...COMMON_HEADERS};

      const request = {
        method: 'PATCH',
        headers,
      };

      authorizeRequest(request, extraParams);

      applyExtraParams(request, extraParams);

      let response = await callJsonApi(url, request);

      response = camelCaseDeep(response);

      dispatchSuccess('readEmployeeList', undefined, response);

      return transformResponse<ReadEmployeeListResponse>('readEmployeeList', response);
    }
  `);
});

test('action returns raw response', () => {
  const openapi = OpenAPIFactory.create();

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

  expect(action.context.project.getSourceFile('src/types.ts')).toHaveFormattedTypeScriptText(`
    import type {
      JSONAPIServerResource,
      JSONAPIDataDocument,
    } from "@fresha/api-tools-core";

    /**
     * EmployeeResource
     *
     */
    export type EmployeeResource = JSONAPIServerResource<'employees'>;

    /**
     * This is a response resource
     *
     * Primary data resources:
     *  - EmployeeResource
     *
     */
    export type ReadEmployeeListResponse = JSONAPIDataDocument<EmployeeResource[]>;
  `);

  expect(action.context.project.getSourceFile('src/index.ts')).toHaveFormattedTypeScriptText(`
    import {
      COMMON_HEADERS,
      makeUrl,
      callApi,
      ExtraCallParams,
      applyExtraParams
    } from './utils';
    import type { ReadEmployeeListResponse } from './types';

    /**
     * @param [extraParams] additional parameters
     * @param [extraParams.authCookieName] name of the authorization cookie for this request
     * @param [extraParams.authCookie] value of the authorization cookie for this request
     * @param [extraParams.xForwardedFor] sends X-Forwarded-For header with specified value
     * @param [extraParams.xForwardedHost] sends X-Forwarded-Host header with specified value
     * @param [extraParams.xForwardedProto] sends X-Forwarded-Proto header with specified value
     */
    export async function readEmployeeList(
      extraParams?: ExtraCallParams,
    ): Promise<Response> {
      const url = makeUrl(\`/employees\`);

      const headers = {...COMMON_HEADERS};

      const request = {
        headers,
      };

      applyExtraParams(request, extraParams);

      const response = await callApi(url, request);

      return response;
    }
  `);
});

test('test optional header parameters', () => {
  const openapi = OpenAPIFactory.create();
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

  expect(action.context.project.getSourceFile('src/index.ts')).toHaveFormattedTypeScriptText(`
    import {
      COMMON_HEADERS,
      makeUrl,
      callJsonApi,
      addQueryParam,
      authorizeRequest,
      ExtraCallParams,
      applyExtraParams,
    } from './utils';

    /**
     * operation with an optional header
     *
     * This operation has an optional header parameter
     *
     * @param params call parameters
     * @param [params.OptionalHeaderParameter] optional header parameter
     *
     * @param [extraParams] additional parameters
     * @param [extraParams.authCookieName] name of the authorization cookie for this request
     * @param [extraParams.authCookie] value of the authorization cookie for this request
     * @param [extraParams.xForwardedFor] sends X-Forwarded-For header with specified value
     * @param [extraParams.xForwardedHost] sends X-Forwarded-Host header with specified value
     * @param [extraParams.xForwardedProto] sends X-Forwarded-Proto header with specified value
     */
    export async function test(
      params: {
        OptionalHeaderParameter?: string,
      },
      extraParams?: ExtraCallParams,
    ): Promise<void> {
      const url = makeUrl(\`/test-endpoint\`);

      const headers = {...COMMON_HEADERS};

      if (params.OptionalHeaderParameter)
        headers['Optional-Header-Parameter'] = params.OptionalHeaderParameter;

      const request = {
        headers,
      };

      authorizeRequest(request, extraParams);

      applyExtraParams(request, extraParams);

      await callJsonApi(url, request);

      return;
    }
  `);
});

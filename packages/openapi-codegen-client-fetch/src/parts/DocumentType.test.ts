import assert from 'assert';

import {
  getOperationDefaultResponseSchemaOrThrow,
  MEDIA_TYPE_JSON_API,
  setResourceSchema,
} from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OperationModel, SchemaFactory } from '@fresha/openapi-model/build/3.0.3';

import { createActionTestContext } from '../testHelpers';

import { DocumentType } from './DocumentType';

import type { NamedType } from './NamedType';

import '@fresha/openapi-codegen-test-utils/build/matchers';

const createDocumentType = (operation: OperationModel, name: string): DocumentType => {
  const context = createActionTestContext(operation, '/src/index.ts');
  const schema = getOperationDefaultResponseSchemaOrThrow(operation, true);
  assert(schema);
  return new DocumentType(context, name, schema, false);
};

let operation = OpenAPIFactory.create().setPathItem('/hello').setOperation('get');
let namedTypes = new Map<string, NamedType>();
let generatedTypes = new Set<string>();

beforeEach(() => {
  operation = OpenAPIFactory.create().setPathItem('/hello').setOperation('get');
  namedTypes = new Map<string, NamedType>();
  generatedTypes = new Set<string>();
});

test('generic', () => {
  operation.setDefaultResponse('test').setContent(MEDIA_TYPE_JSON_API).setSchema(null);

  const documentType = createDocumentType(operation, 'SimpleResponseDocument');

  documentType.collectData(namedTypes);
  documentType.generateCode(generatedTypes);

  expect(documentType.context.project.getSourceFile('src/index.ts')).toHaveFormattedTypeScriptText(`
    import type { JSONAPIDataDocument } from '@fresha/api-tools-core';

    export type SimpleResponseDocument = JSONAPIDataDocument;
  `);
});

describe('primary data', () => {
  let responseSchema = operation
    .setDefaultResponse('test')
    .setContent(MEDIA_TYPE_JSON_API)
    .setSchema('object');

  beforeEach(() => {
    responseSchema = operation
      .setDefaultResponse('test')
      .setContent(MEDIA_TYPE_JSON_API)
      .setSchema('object');
    responseSchema.setProperties({
      jsonapi: { type: 'object', required: true },
      data: { type: 'object', required: true },
    });
  });

  test('single shared resource', () => {
    const employee = responseSchema.root.components.setSchema('Employee', 'object');
    employee.setProperties({
      type: { type: 'string', required: true, enum: ['employees'] },
      id: { type: 'string', required: true },
      attributes: { type: 'object', required: true },
    });
    responseSchema.setProperty('data', employee);

    const documentType = createDocumentType(operation, 'SimpleResponseDocument');

    documentType.collectData(namedTypes);
    documentType.generateCode(generatedTypes);

    expect(documentType.context.project.getSourceFile('src/index.ts'))
      .toHaveFormattedTypeScriptText(`
      import type {
        JSONAPIServerResource,
        JSONAPIDataDocument,
      } from '@fresha/api-tools-core';

      export type Employee = JSONAPIServerResource<'employees', {}>;

      export type SimpleResponseDocument = JSONAPIDataDocument<Employee>;
    `);
  });

  test('single inline resource', () => {
    const primaryData = responseSchema.getPropertyOrThrow('data');
    primaryData.setProperties({
      type: { type: 'string', required: true, enum: ['employees'] },
      id: { type: 'string', required: true },
      attributes: { type: 'object', required: true },
    });

    const documentType = createDocumentType(operation, 'SimpleResponseDocument');

    documentType.collectData(namedTypes);
    documentType.generateCode(generatedTypes);

    expect(documentType.context.project.getSourceFile('src/index.ts'))
      .toHaveFormattedTypeScriptText(`
      import type {
        JSONAPIServerResource,
        JSONAPIDataDocument,
      } from '@fresha/api-tools-core';

      export type Unknown1 = JSONAPIServerResource<'employees', {}>;

      export type SimpleResponseDocument = JSONAPIDataDocument<Unknown1>;
    `);
  });

  test('single resource of possibly multiple types', () => {
    const primaryData = responseSchema.getPropertyOrThrow('data');
    primaryData.type = null;

    const employee = primaryData.addOneOf(null);
    setResourceSchema(employee, 'employees');

    const organization = primaryData.addOneOf(null);
    setResourceSchema(organization, 'organizations');

    const documentType = createDocumentType(operation, 'ResponseDocumentWithUnionTypes');

    documentType.collectData(namedTypes);
    documentType.generateCode(generatedTypes);

    expect(documentType.context.project.getSourceFile('src/index.ts'))
      .toHaveFormattedTypeScriptText(`
      import type {
        JSONAPIServerResource,
        JSONAPIDataDocument,
      } from '@fresha/api-tools-core';

      export type EmployeeResource = JSONAPIServerResource<'employees', {}>;

      export type OrganizationResource = JSONAPIServerResource<'organizations', {}>;

      export type ResponseDocumentWithUnionTypes = JSONAPIDataDocument<EmployeeResource | OrganizationResource>;
    `);
  });

  test('multiple resources of the same type', () => {
    const employee = responseSchema.root.components.setSchema('Employee', 'object');
    employee.setProperties({
      type: { type: 'string', required: true, enum: ['employees'] },
      id: { type: 'string', required: true },
      attributes: { type: 'object', required: true },
    });

    responseSchema.setProperty('data', 'array').items = employee;

    const documentType = createDocumentType(operation, 'SimpleResponseDocument');

    documentType.collectData(namedTypes);
    documentType.generateCode(generatedTypes);

    expect(documentType.context.project.getSourceFile('src/index.ts'))
      .toHaveFormattedTypeScriptText(`
      import type {
        JSONAPIServerResource,
        JSONAPIDataDocument,
      } from '@fresha/api-tools-core';

      export type Employee = JSONAPIServerResource<'employees', {}>;

      export type SimpleResponseDocument = JSONAPIDataDocument<Employee[]>;
    `);
  });

  test('multiple resources of different types', () => {});
});

describe('included', () => {
  let responseSchema = operation
    .setDefaultResponse('test')
    .setContent(MEDIA_TYPE_JSON_API)
    .setSchema('object');

  beforeEach(() => {
    responseSchema = operation
      .setDefaultResponse('test')
      .setContent(MEDIA_TYPE_JSON_API)
      .setSchema('object');
    responseSchema.setProperties({
      jsonapi: { type: 'object', required: true },
      data: { type: 'object', required: true },
    });
  });

  test('single type of included resources', () => {
    const employee = responseSchema.root.components.setSchema('Employee', 'object');
    employee.setProperties({
      type: { type: 'string', required: true, enum: ['employees'] },
      id: { type: 'string', required: true },
      attributes: { type: 'object', required: true },
    });

    responseSchema.setProperty('data', employee);
    responseSchema.setProperty('included', 'array').items = employee;

    const documentType = createDocumentType(operation, 'DocumentWithIncludedResources');

    documentType.collectData(namedTypes);
    documentType.generateCode(generatedTypes);

    expect(documentType.context.project.getSourceFile('src/index.ts'))
      .toHaveFormattedTypeScriptText(`
      import type {
        JSONAPIServerResource,
        JSONAPIDataDocument,
      } from '@fresha/api-tools-core';

      export type Employee = JSONAPIServerResource<'employees', {}>;

      export type DocumentWithIncludedResources = JSONAPIDataDocument<
        Employee,
        Employee
      >;
    `);
  });

  test('includes resources of multiple types', () => {
    const employee = responseSchema.root.components.setSchema('Employee', 'object');
    employee.setProperties({
      type: { type: 'string', required: true, enum: ['employees'] },
      id: { type: 'string', required: true },
      attributes: { type: 'object', required: true },
    });

    const organization = responseSchema.root.components.setSchema('Organization', 'object');
    organization.setProperties({
      type: { type: 'string', required: true, enum: ['organizations'] },
      id: { type: 'string', required: true },
      attributes: { type: 'object', required: true },
    });

    responseSchema.setProperty('data', employee);

    const includedSchema = responseSchema.setProperty('included', 'array');
    includedSchema.items = SchemaFactory.create(includedSchema, null);
    includedSchema.items.addOneOf(organization);
    includedSchema.items.addOneOf(employee);

    const documentType = createDocumentType(operation, 'DocumentWithIncludedResources');

    documentType.collectData(namedTypes);
    documentType.generateCode(generatedTypes);

    expect(documentType.context.project.getSourceFile('src/index.ts'))
      .toHaveFormattedTypeScriptText(`
      import type {
        JSONAPIServerResource,
        JSONAPIDataDocument,
      } from '@fresha/api-tools-core';

      export type Employee = JSONAPIServerResource<'employees', {}>;

      export type Organization = JSONAPIServerResource<'organizations', {}>;

      export type DocumentWithIncludedResources = JSONAPIDataDocument<
        Employee,
        Organization | Employee
      >;
    `);
  });
});
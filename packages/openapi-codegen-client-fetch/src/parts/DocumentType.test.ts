import assert from 'assert';

import {
  getOperationDefaultResponseSchemaOrThrow,
  MEDIA_TYPE_JSON_API,
  setResourceSchema,
} from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OperationModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

import { createActionTestContext } from '../testHelpers';

import { DocumentType } from './DocumentType';

import type { NamedType } from './NamedType';

const createDocumentType = (operation: OperationModel, name: string): DocumentType => {
  const context = createActionTestContext(operation, '/src/index.ts');
  const schema = getOperationDefaultResponseSchemaOrThrow(operation, true);
  assert(schema);
  return new DocumentType(context, name, schema, false, true);
};

let operation: OperationModel;
let namedTypes: Map<string, NamedType>;
let generatedTypes: Set<string>;

beforeEach(() => {
  operation = OpenAPIFactory.create().setPathItem('/hello').addOperation('get');
  namedTypes = new Map<string, NamedType>();
  generatedTypes = new Set<string>();
});

test('generic', () => {
  operation.setDefaultResponse('test').setMediaType(MEDIA_TYPE_JSON_API).setSchema(null);

  const documentType = createDocumentType(operation, 'SimpleResponseDocument');

  documentType.collectData(namedTypes);
  documentType.generateCode(generatedTypes);

  expect(
    documentType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
  ).toMatchSnapshot('src/types.ts');
});

test('jsdocs', () => {
  const responseSchema = operation
    .setDefaultResponse('default response')
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema('object');
  responseSchema.title = 'A simple object schema';
  responseSchema.description =
    'This is a description of the schema.\nThe schema represents a simple object.';
  responseSchema.setProperties({
    jsonapi: { type: 'object', required: true },
    data: { type: 'object', required: true },
  });

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

  expect(
    documentType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
  ).toMatchSnapshot('src/types.ts');
});

describe('primary data', () => {
  let responseSchema: SchemaModel;

  beforeEach(() => {
    responseSchema = operation
      .setDefaultResponse('test')
      .setMediaType(MEDIA_TYPE_JSON_API)
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

    expect(
      documentType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
    ).toMatchSnapshot('src/types.ts');
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

    expect(
      documentType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
    ).toMatchSnapshot('src/types.ts');
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

    expect(
      documentType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
    ).toMatchSnapshot('src/types.ts');
  });

  test('multiple resources of the same type', () => {
    const employee = responseSchema.root.components.setSchema('Employee', 'object');
    employee.setProperties({
      type: { type: 'string', required: true, enum: ['employees'] },
      id: { type: 'string', required: true },
      attributes: { type: 'object', required: true },
    });

    responseSchema.setProperty('data', 'array').setItems(employee);

    const documentType = createDocumentType(operation, 'SimpleResponseDocument');

    documentType.collectData(namedTypes);
    documentType.generateCode(generatedTypes);

    expect(
      documentType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
    ).toMatchSnapshot('src/types.ts');
  });

  test('skip resources that were generated before', () => {
    const employee = responseSchema.root.components.setSchema('Employee', 'object');
    employee.setProperties({
      type: { type: 'string', required: true, enum: ['employees'] },
      id: { type: 'string', required: true },
      attributes: { type: 'object', required: true },
    });

    responseSchema.setProperty('data', 'array').setItems(employee);

    // pretend that this resource is used in multiple documents, and rendered before
    generatedTypes.add('Employee');

    const documentType = createDocumentType(operation, 'SimpleResponseDocument');

    documentType.collectData(namedTypes);
    documentType.generateCode(generatedTypes);

    expect(
      documentType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
    ).toMatchSnapshot('src/types.ts');
  });
});

describe('included', () => {
  let responseSchema: SchemaModel;

  beforeEach(() => {
    responseSchema = operation
      .setDefaultResponse('test')
      .setMediaType(MEDIA_TYPE_JSON_API)
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
    responseSchema.setProperty('included', 'array').setItems(employee);

    const documentType = createDocumentType(operation, 'DocumentWithIncludedResources');

    documentType.collectData(namedTypes);
    documentType.generateCode(generatedTypes);

    expect(
      documentType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
    ).toMatchSnapshot('src/types.ts');
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
    const includedItemSchema = includedSchema.setItems(null);
    includedItemSchema.addOneOf(organization);
    includedItemSchema.addOneOf(employee);

    const documentType = createDocumentType(operation, 'DocumentWithIncludedResources');

    documentType.collectData(namedTypes);
    documentType.generateCode(generatedTypes);

    expect(
      documentType.context.project.getSourceFileOrThrow('src/types.ts').getText(),
    ).toMatchSnapshot('src/types.ts');
  });
});

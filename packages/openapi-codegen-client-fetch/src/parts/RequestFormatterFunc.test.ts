import { buildEmployeeSchemasForTesting } from '@fresha/openapi-codegen-test-utils';
import {
  addResourceRelationships,
  MEDIA_TYPE_JSON_API,
  RelationshipCardinality,
  setDataDocumentSchema,
} from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { createActionTestContext } from '../testHelpers';

import { DocumentType } from './DocumentType';
import { NamedType } from './NamedType';
import { RequestFormatterFunc } from './RequestFormatterFunc';

let openapi: OpenAPIModel;

beforeEach(() => {
  openapi = OpenAPIFactory.create();
});

test('simple', () => {
  buildEmployeeSchemasForTesting(openapi);

  const operation = openapi.setPathItem('/employees').addOperation('post');
  operation.operationId = 'createEmployee';

  const requestBodySchema = operation
    .setRequestBody()
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema('object');
  requestBodySchema.title = 'CreateEmployeeRequest';
  setDataDocumentSchema(requestBodySchema, 'employees');

  requestBodySchema
    .getPropertyDeepOrThrow('data')
    .getPropertyDeepOrThrow('attributes')
    .setProperties({
      'full-name': { type: 'string', required: true },
      age: { type: 'integer', required: true },
      gender: { type: 'string', enum: ['male', 'female'] },
    });

  addResourceRelationships(requestBodySchema.getPropertyDeepOrThrow('data'), {
    manager: {
      resourceType: 'employees',
      cardinality: RelationshipCardinality.One,
      required: true,
    },
    subordinates: {
      resourceType: 'employees',
      cardinality: RelationshipCardinality.Many,
      required: false,
    },
    mentor: {
      resourceType: 'employees',
      cardinality: RelationshipCardinality.ZeroOrOne,
      required: false,
    },
  });

  const namedTypes = new Map<string, NamedType>();
  const generatedTypes = new Set<string>();

  const context = createActionTestContext(operation, 'src/index.ts');
  const requestType = new DocumentType(
    context,
    'CreateEmployeeRequest',
    requestBodySchema,
    true,
    true,
  );
  requestType.collectData(namedTypes);

  for (const namedType of namedTypes.values()) {
    namedType.generateCode(generatedTypes);
  }

  const requestFormatter = new RequestFormatterFunc(requestType);
  requestFormatter.collectData();
  requestFormatter.generateCode();

  expect(
    requestFormatter.context.project.getSourceFileOrThrow('src/formatters.ts').getText(),
  ).toMatchSnapshot('src/formatters.ts');
});

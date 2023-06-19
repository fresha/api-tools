import { Nullable } from '@fresha/api-tools-core';
import { buildEmployeeSchemasForTesting } from '@fresha/openapi-codegen-test-utils';
import {
  addResourceRelationships,
  MEDIA_TYPE_JSON_API,
  RelationshipCardinality,
  setDataDocumentSchema,
} from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';

import { ActionContext } from '../context';
import { createActionTestContext } from '../testHelpers';

import { DocumentType } from './DocumentType';
import { NamedType } from './NamedType';
import { RequestFormatterFunc } from './RequestFormatterFunc';
import { NamingConvention } from './utils';

test.each([[null], ['camel'], ['snake'], ['kebab'], ['title']] as [Nullable<NamingConvention>][])(
  'client naming = %s',
  (clientNaming: Nullable<NamingConvention>) => {
    const openapi = OpenAPIFactory.create();

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
        is_active: 'boolean',
      });

    addResourceRelationships(requestBodySchema.getPropertyDeepOrThrow('data'), {
      'Line-manager': {
        resourceType: 'employees',
        cardinality: RelationshipCardinality.One,
        required: true,
      },
      'subordinate-list': {
        resourceType: 'employees',
        cardinality: RelationshipCardinality.Many,
        required: false,
      },
      Mentor: {
        resourceType: 'employees',
        cardinality: RelationshipCardinality.ZeroOrOne,
        required: false,
      },
    });

    const namedTypes = new Map<string, NamedType>();
    const generatedTypes = new Set<string>();

    const context: ActionContext = {
      ...createActionTestContext(operation, 'src/index.ts'),
      clientNaming,
    };
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
  },
);

import assert from 'assert';

import '@fresha/jest-config/build/types';

import { OpenAPIFactory, OpenAPIModel, SchemaFactory } from '@fresha/openapi-model/build/3.0.3';
import { Schema } from '@fresha/openapi-model/build/3.0.3/model/Schema';
import { Project } from 'ts-morph';

import { Generator } from './Generator';

const buildInMemoryTSProject = (): Project => {
  const result = new Project({ useInMemoryFileSystem: true });
  result.createSourceFile(
    '/tmp/web.module.ts',
    ` import { Module } from '@nestjs/common';
      @Module({
        imports: [],
        controllers: [],
        providers: [],
      })
      export class WebModule {}`,
  );
  return result;
};

const buildBasicJSONAPI = (): OpenAPIModel => {
  const openapi = OpenAPIFactory.create();

  const versionSchema = openapi.components.setSchema('JSONAPIVersion', 'object');
  versionSchema.setProperty('version', { type: 'string', required: true });

  const resourceIdSchema = openapi.components.setSchema('JSONAPIResourceId', 'object');
  resourceIdSchema.setProperties({
    type: { type: 'string', required: true },
    id: { type: 'string', required: true },
  });

  const resourceIdListSchema = openapi.components.setSchema('JSONAPIResourceIdList', 'array');
  resourceIdListSchema.items = resourceIdSchema;

  const relationshipSchema = openapi.components.setSchema('JSONAPIRelationship', 'object');
  const relationshipDataSchema = relationshipSchema.setProperty('data', {
    type: null,
    required: true,
  });
  relationshipDataSchema.addOneOf(resourceIdSchema);
  relationshipDataSchema.addOneOf(resourceIdListSchema);

  const resourceSchema = openapi.components.setSchema('JSONAPIResource', 'object');
  resourceSchema.setProperties({
    type: { type: 'string', required: true },
    id: { type: 'string', required: true },
    attributes: { type: 'object', required: true },
    relationships: 'object',
  });

  const resourceRelationshipsPropertySchema = resourceSchema.properties.get('relationships');
  assert(resourceRelationshipsPropertySchema);
  resourceRelationshipsPropertySchema.additionalProperties = relationshipSchema;

  const resourceListSchema = openapi.components.setSchema('JSONAPIResourceList', 'array');
  resourceListSchema.items = resourceSchema;

  const dataDocumentSchema = openapi.components.setSchema('JSONAPIDataDocument', 'object');
  dataDocumentSchema.setProperty('jsonapi', versionSchema);

  const dataSchema = dataDocumentSchema.setProperty('data', { type: null, required: true });
  dataSchema.addOneOf(resourceIdSchema);
  dataSchema.addOneOf(resourceIdListSchema);
  dataSchema.addOneOf(resourceSchema);
  dataSchema.addOneOf(resourceListSchema);

  dataDocumentSchema.setProperty('included', resourceListSchema);

  const errorSchema = openapi.components.setSchema('JSONAPIError', 'object');
  errorSchema.setProperties({
    id: 'string',
    status: 'string',
    code: 'string',
    title: 'string',
    detail: 'string',
    source: 'object',
  });

  const errorSourceSchema = errorSchema.properties.get('source');
  assert(errorSourceSchema);
  errorSourceSchema.setProperties({
    pointer: 'string',
    parameter: 'string',
  });

  const errorDocumentSchema = openapi.components.setSchema('JSONAPIErrorDocument', 'object');
  errorDocumentSchema.setProperty('jsonapi', versionSchema);

  errorDocumentSchema.setProperty('errors', {
    type: SchemaFactory.createArray(errorDocumentSchema as Schema, errorSourceSchema),
    required: true,
  });

  const requestBody = openapi.components.setRequestBody('JSONAPIRequest');
  const requestMimeType = requestBody.setContent('application/vnd.api+json');
  requestMimeType.schema = dataDocumentSchema;

  const dataResponse = openapi.components.setResponse(
    'JSONAPIDataResponse',
    'Generic success response',
  );
  const responseMediaType = dataResponse.setContent('application/vnd.api+json');
  responseMediaType.schema = dataDocumentSchema;

  const errorResponse = openapi.components.setResponse(
    'JSONAPIErrorResponse',
    'Generic error response',
  );
  const errorResponseMediaType = errorResponse.setContent('application/vnd.api+json');
  errorResponseMediaType.schema = errorDocumentSchema;

  return openapi;
};

let tsProject = buildInMemoryTSProject();

beforeEach(() => {
  tsProject = buildInMemoryTSProject();
});

test('simple JSON:API schema', () => {
  const openapi = buildBasicJSONAPI();

  const pathItem = openapi.setPathItem('/api');

  const postOperation = pathItem.setOperation('post');
  postOperation.operationId = 'createEntity';

  const postResponse = postOperation.setDefaultResponse('Success response');
  const postResponseContent = postResponse.setContent('application/vnd.api+json');
  postResponseContent.schema = openapi.components.schemas.get('JSONAPIDataDocument')!;

  const generator = new Generator(openapi, tsProject, {
    outputPath: '/tmp',
    nestApp: 'web',
    useJsonApi: true,
    verbose: false,
    dryRun: true,
  });

  generator.run();

  const dtoFile = tsProject.getSourceFileOrThrow('/tmp/dto/CreateEntityResponse.dto.ts');

  expect(dtoFile).toHaveFormattedText(`import { ValidateNested, IsArray } from "class-validator";

    export class CreateEntityResponse {
      @ValidateNested()
      jsonapi?: object;
      @ValidateNested()
      data: unknown;
      @IsArray()
      included?: object[];
    }
  `);
});

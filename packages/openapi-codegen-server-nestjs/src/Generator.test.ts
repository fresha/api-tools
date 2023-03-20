import '@fresha/openapi-codegen-test-utils/build/matchers';
import { MEDIA_TYPE_JSON_API } from '@fresha/openapi-codegen-utils';
import { OpenAPIModel, SchemaFactory } from '@fresha/openapi-model/build/3.0.3';
import { Schema } from '@fresha/openapi-model/build/3.0.3/model/Schema';

import { createGenerator } from './testHelpers';

const buildBasicJSONAPI = (openapi: OpenAPIModel): void => {
  const versionSchema = openapi.components.setSchema('JSONAPIVersion', 'object');
  versionSchema.setProperty('version', { type: 'string', required: true });

  const resourceIdSchema = openapi.components.setSchema('JSONAPIResourceId', 'object');
  resourceIdSchema.setProperties({
    type: { type: 'string', required: true },
    id: { type: 'string', required: true },
  });

  const resourceIdListSchema = openapi.components.setSchema('JSONAPIResourceIdList', 'array');
  resourceIdListSchema.setItems(resourceIdSchema);

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

  resourceSchema.getPropertyOrThrow('relationships').setAdditionalProperties(relationshipSchema);

  const resourceListSchema = openapi.components.setSchema('JSONAPIResourceList', 'array');
  resourceListSchema.setItems(resourceSchema);

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

  const errorSourceSchema = errorSchema.getPropertyOrThrow('source');
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

  openapi.components
    .setRequestBody('JSONAPIRequest')
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema(dataDocumentSchema);

  openapi.components
    .setResponse('JSONAPIDataResponse', 'Generic success response')
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema(dataDocumentSchema);

  const errorResponse = openapi.components.setResponse(
    'JSONAPIErrorResponse',
    'Generic error response',
  );
  errorResponse.setMediaType(MEDIA_TYPE_JSON_API).setSchema(errorDocumentSchema);
};

test('simple JSON:API schema', () => {
  const generator = createGenerator('web', '/tmp');

  buildBasicJSONAPI(generator.context.openapi);

  const pathItem = generator.context.openapi.setPathItem('/api');

  const postOperation = pathItem.addOperation('post');
  postOperation.operationId = 'createEntity';

  postOperation
    .setDefaultResponse('Success response')
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema(generator.context.openapi.components.getSchemaOrThrow('JSONAPIDataDocument'));

  generator.run();

  const dtoFile = generator.context.project.getSourceFileOrThrow(
    '/tmp/dto/CreateEntityResponse.dto.ts',
  );

  expect(dtoFile).toHaveFormattedTypeScriptText(`
    import { Type, Expose } from 'class-transformer';
    import { IsString, ValidateNested, IsArray } from 'class-validator';

    export class CreateEntityResponse {
      @Expose()
      @Type(() => CreateEntityResponseJsonapi)
      @ValidateNested()
      jsonapi?: CreateEntityResponseJsonapi;

      @Expose()
      @ValidateNested()
      data: unknown;

      @Expose()
      @IsArray()
      included?: object[];
    }

    export class CreateEntityResponseJsonapi {
      @Expose()
      @IsString()
      version: string;
    }
  `);
});

import fs from 'fs';
import path from 'path';

import yaml from 'yaml';

import { OpenAPI, OpenAPIFactory } from './OpenAPI';
import { OpenAPIWriter } from './OpenAPIWriter';
import { RequestBody } from './RequestBody';
import { Schema, SchemaFactory } from './Schema';

import type { JSONObject } from '@fresha/api-tools-core';

test('how easy is to use this class', () => {
  const api = OpenAPIFactory.create('Test of this class ease of use', '0.1.0');

  api.info.contact.name = 'developers';
  api.info.contact.url = 'https://www.examples.com';

  api.addServer('http://localhost:{port}', { port: '4700' }, 'local');
  api.addServer('https://partners-api-{namespace}.{domain}', {
    namespace: 'staging',
    domain: 'dev.fresha.io',
  });
  api.addServer('https://partners-app.fresha.com');

  const pathItem = api.setPathItem('/api/v1');
  const operation = pathItem.setOperation('get');

  expect(pathItem.get).toBe(operation);
});

test('build schema - simple', () => {
  const api = OpenAPIFactory.create('Sample API', '1.0.0');
  api.info.description = 'A sample API to illustrate OpenAPI concepts';

  const pathItem = api.setPathItem('/list');
  const operation = pathItem.setOperation('get');
  operation.description = 'Returns a list of stuff';
  operation.responses.setResponse(200, 'Successful response');

  const writer = new OpenAPIWriter();
  const outputData = writer.write(api);

  const inputText = fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'examples', 'simple.yaml'),
    'utf-8',
  );
  const inputData = yaml.parse(inputText) as JSONObject;

  expect(outputData).toStrictEqual(inputData);
});

test('build schema - petstore', () => {
  const api = new OpenAPI('Swagger Petstore', '1.0.0');

  // info
  api.info.description =
    'A sample API that uses a petstore as an example to demonstrate features in the OpenAPI 3.0 specification';
  api.info.termsOfService = 'http://swagger.io/terms/';
  api.info.contact.name = 'Swagger API Team';
  api.info.contact.email = 'apiteam@swagger.io';
  api.info.contact.url = 'http://swagger.io';
  api.info.license.name = 'Apache 2.0';
  api.info.license.url = 'https://www.apache.org/licenses/LICENSE-2.0.html';

  // servers
  api.addServer('http://petstore.swagger.io/api');

  //
  // components
  //

  const newPetSchema = api.components.setSchema('NewPet', 'object').setProperties({
    name: { type: 'string', required: true },
    tag: 'string',
  });

  const errorSchema = api.components.setSchema('Error', 'object').setProperties({
    code: { type: 'int32', required: true },
    message: { type: 'string', required: true },
  });

  const petSchema = api.components.setSchema('Pet');
  petSchema.addAllOf(newPetSchema);
  petSchema.addAllOf({ type: 'object', properties: { id: { type: 'int64', required: true } } });

  //
  // pathItems
  //

  const collectionPathItem = api.setPathItem('/pets');

  //
  // findPets
  //

  const findPetsOperation = collectionPathItem.setOperation('get');
  findPetsOperation.description = `Returns all pets from the system that the user has access to
Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.

Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.
`;
  findPetsOperation.operationId = 'findPets';

  const paramTags = findPetsOperation.addParameter('tags', 'query');
  paramTags.description = 'tags to filter by';
  paramTags.schema = Schema.createArray(paramTags, 'string');

  const paramLimit = findPetsOperation.addParameter('limit', 'query');
  paramLimit.description = 'maximum number of results to return';
  paramLimit.schema = SchemaFactory.create(paramLimit, 'int32');

  const findPetsResponse200 = findPetsOperation.responses.setResponse(200, 'pet response');
  const findPetsMediaType200 = findPetsResponse200.setContent('application/json');
  findPetsMediaType200.schema = petSchema.arrayOf(findPetsMediaType200);

  const findPetsDefaultResponse =
    findPetsOperation.responses.setDefaultResponse('unexpected error');
  const findPetsDefaultMediaType = findPetsDefaultResponse.setContent('application/json');
  findPetsDefaultMediaType.schema = errorSchema;

  //
  // addPet
  //

  const addPetOperation = collectionPathItem.setOperation('post');
  addPetOperation.description = 'Creates a new pet in the store. Duplicates are allowed';
  addPetOperation.operationId = 'addPet';

  const addPetRequest = new RequestBody(addPetOperation);
  addPetRequest.description = 'Pet to add to the store';
  addPetRequest.required = true;
  addPetOperation.requestBody = addPetRequest;

  const addPetMediaType = addPetRequest.setContent('application/json');
  addPetMediaType.schema = newPetSchema;

  const addPetResponse200 = addPetOperation.responses.setResponse(200, 'pet response');
  const mediaType200 = addPetResponse200.setContent('application/json');
  mediaType200.schema = petSchema;

  const addPetDefaultResponse = addPetOperation.responses.setDefaultResponse('unexpected error');
  const addPetDefaultResponseMediaType = addPetDefaultResponse.setContent('application/json');
  addPetDefaultResponseMediaType.schema = errorSchema;

  const itemPathItem = api.setPathItem('/pets/{id}');

  //
  // find pet by id
  //

  const getPetOperation = itemPathItem.setOperation('get');
  getPetOperation.description =
    'Returns a user based on a single ID, if the user does not have access to the pet';
  getPetOperation.operationId = 'find pet by id';

  const getIdParam = getPetOperation.addParameter('id', 'path');
  getIdParam.description = 'ID of pet to fetch';
  getIdParam.schema = SchemaFactory.create(getIdParam, 'int64');

  const getPetResponse200 = getPetOperation.responses.setResponse(200, 'pet response');
  const getPetMediaType200 = getPetResponse200.setContent('application/json');
  getPetMediaType200.schema = petSchema;

  const getPetDefaultResponse = getPetOperation.responses.setDefaultResponse('unexpected error');
  const getPetDefaultMediaType = getPetDefaultResponse.setContent('application/json');
  getPetDefaultMediaType.schema = errorSchema;

  //
  // deletePet
  //

  const deletePetOperation = itemPathItem.setOperation('delete');
  deletePetOperation.description = 'deletes a single pet based on the ID supplied';
  deletePetOperation.operationId = 'deletePet';

  const deleteIdParam = deletePetOperation.addParameter('id', 'path');
  deleteIdParam.description = 'ID of pet to delete';
  deleteIdParam.schema = Schema.create(deleteIdParam, 'int64');

  // const deleteResponse204 = deletePetOperation.responses.setResponse(204, 'pet deleted');
  deletePetOperation.responses.setResponse(204, 'pet deleted');
  // deleteResponse204.setContent('application/json');

  const deleteResponseDefault = deletePetOperation.responses.setDefaultResponse('unexpected error');
  const deleteResponseMediaType = deleteResponseDefault.setContent('application/json');
  deleteResponseMediaType.schema = errorSchema;

  //
  // tags
  //

  api.addTag('tag1').description = 'The first tag';
  api.addTag('tag2').description = 'Second tag';

  //
  // comparison
  //

  const writer = new OpenAPIWriter();
  const outputData = writer.write(api);

  const inputText = fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'examples', 'petstore.yaml'),
    'utf-8',
  );
  const inputData = yaml.parse(inputText) as JSONObject;

  expect(outputData).toStrictEqual(inputData);
});

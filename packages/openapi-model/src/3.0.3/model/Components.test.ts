import { Callback } from './Callback';
import { Example } from './Example';
import { Link } from './Link';
import { OpenAPIFactory } from './OpenAPI';
import { PathParameter, QueryParameter } from './Parameter';
import { RequestBody } from './RequestBody';
import { Response } from './Response';
import { SchemaFactory } from './Schema';
import { ParameterLocation, SecuritySchemeType } from './types';

let openapi = OpenAPIFactory.create();
let { components } = openapi;

beforeEach(() => {
  openapi = OpenAPIFactory.create();
  components = openapi.components;
});

describe('schemas', () => {
  beforeEach(() => {
    components.setSchema('Integer', 'integer');
    components.setSchema('Empty');
  });

  test('setSchemaModel logic', () => {
    const parent = components.setSchema('Parent', 'object');
    const child = parent.setProperty('child', 'integer');

    expect(() => components.setSchemaModel('Parent', parent)).toThrow();
    expect(() => components.setSchemaModel('Child', parent)).toThrow();
    expect(() => components.setSchemaModel('Child', child)).toThrow();

    const other = SchemaFactory.create(components, 'binary');
    components.setSchemaModel('Other', other);

    expect(components.schemas.get('Other')).toBe(other);
  });

  test('setSchema', () => {
    expect(components.schemas.size).toBe(2);

    const integerSchema = components.schemas.get('Integer');
    expect(integerSchema).toHaveProperty('parent', components);

    const emptySchema = components.schemas.get('Empty');
    expect(emptySchema).toHaveProperty('parent', components);
  });

  test('deleteSchema', () => {
    components.deleteSchema('Empty');
    expect(Array.from(components.schemas.keys())).toStrictEqual(['Integer']);
  });

  test('clearSchemas', () => {
    components.clearSchemas();
    expect(components.schemas.size).toBe(0);
  });
});

describe('responses', () => {
  beforeEach(() => {
    components.setResponse('Success', 'Success response');
    components.setResponse('Error500', 'Error 5xx');
  });

  test('setResponseModel logic', () => {
    const sharedResponse = components.setResponse('Parent', 'some response');

    const pathItemResponse = openapi
      .setPathItem('/')
      .setOperation('get')
      .setResponse(200, 'success');

    expect(() => components.setResponseModel('Parent', sharedResponse)).toThrow();
    expect(() => components.setResponseModel('Child', sharedResponse)).toThrow();
    expect(() => components.setResponseModel('Child', pathItemResponse)).toThrow();

    const anotherSharedResponse = new Response(components, 'another');
    components.setResponseModel('Another', anotherSharedResponse);

    expect(components.responses.get('Another')).toBe(anotherSharedResponse);
  });

  test('setResponse', () => {
    expect(components.responses.size).toBe(2);

    const successResponse = components.responses.get('Success');
    expect(successResponse).toHaveProperty('parent', components);

    const errorResponse = components.responses.get('Error500');
    expect(errorResponse).toHaveProperty('parent', components);
  });

  test('deleteResponse', () => {
    components.deleteResponse('Success');

    expect(Array.from(components.responses.keys())).toStrictEqual(['Error500']);
  });

  test('clearResponses', () => {
    components.clearResponses();

    expect(components.responses.size).toBe(0);
  });
});

describe('parameters', () => {
  beforeEach(() => {
    components.setParameter('ID', 'path', 'id');
    components.setParameter('Offset', 'query', 'offset');
    components.setParameter('Language', 'header', 'Language');
    components.setParameter('SessionID', 'cookie', 'session');
  });

  test('setResponseModel logic', () => {
    const sharedParam = components.setParameter('Parent', 'path', 'id');

    const operationParam = openapi.setPathItem('/').setOperation('get').addParameter('ns', 'path');

    expect(() => components.setParameterModel('Parent', sharedParam)).toThrow();
    expect(() => components.setParameterModel('Child', sharedParam)).toThrow();
    expect(() => components.setParameterModel('Child', operationParam)).toThrow();

    const anotherSharedParam = new PathParameter(components, 'another');
    components.setParameterModel('Another', anotherSharedParam);

    expect(components.parameters.get('Another')).toBe(anotherSharedParam);
  });

  test('setParameter', () => {
    expect(components.parameters.size).toBe(4);

    const idParam = components.parameters.get('ID');
    expect(idParam).toHaveProperty('parent', components);
    expect(idParam).toHaveProperty('in', 'path');
    expect(idParam).toHaveProperty('name', 'id');

    const offsetParam = components.parameters.get('Offset');
    expect(offsetParam).toHaveProperty('parent', components);
    expect(offsetParam).toHaveProperty('in', 'query');
    expect(offsetParam).toHaveProperty('name', 'offset');

    const languageParam = components.parameters.get('Language');
    expect(languageParam).toHaveProperty('parent', components);
    expect(languageParam).toHaveProperty('in', 'header');
    expect(languageParam).toHaveProperty('name', 'Language');

    const sessionParam = components.parameters.get('SessionID');
    expect(sessionParam).toHaveProperty('parent', components);
    expect(sessionParam).toHaveProperty('in', 'cookie');
    expect(sessionParam).toHaveProperty('name', 'session');

    expect(() => components.setParameter('key', 'kookie' as ParameterLocation, 'wrong')).toThrow();
  });

  test('deleteParameter', () => {
    components.deleteParameter('ID');

    expect(components.parameters.size).toBe(3);

    expect(Array.from(components.parameters.keys())).toStrictEqual([
      'Offset',
      'Language',
      'SessionID',
    ]);
  });

  test('clearParameters', () => {
    components.clearParameters();

    expect(components.parameters.size).toBe(0);
  });
});

describe('examples', () => {
  beforeEach(() => {
    components.setExample('Success');
    components.setExample('Error');
  });

  test('setExampleModel logic', () => {
    const sharedExample = components.setExample('Parent');

    const pathItemExample = new Example(new QueryParameter(openapi.setPathItem('/x/{id}'), 'q'));

    expect(() => components.setExampleModel('Parent', sharedExample)).toThrow();
    expect(() => components.setExampleModel('Child', sharedExample)).toThrow();
    expect(() => components.setExampleModel('Child', pathItemExample)).toThrow();

    const anotherSharedExample = new Example(components);
    components.setExampleModel('Another', anotherSharedExample);

    expect(components.examples.get('Another')).toBe(anotherSharedExample);
  });

  test('setExample', () => {
    expect(components.examples.size).toBe(2);
    expect(components.examples.get('Success')).toHaveProperty('parent', components);
    expect(components.examples.get('Error')).toHaveProperty('parent', components);
  });

  test('deleteExample', () => {
    components.deleteExample('Success');

    expect(components.examples.size).toBe(1);
    expect(components.examples.get('Error')).toBeTruthy();
  });

  test('clearExamples', () => {
    components.clearExamples();

    expect(components.examples.size).toBe(0);
  });
});

describe('requestBodies', () => {
  beforeEach(() => {
    components.setRequestBody('Empty');
    components.setRequestBody('List');
  });

  test('setRequestBodyModel logic', () => {
    const sharedRequestBody = components.setRequestBody('Req');

    const operation = openapi.setPathItem('/').setOperation('post');
    const operationRequestBody = new RequestBody(operation);

    expect(() => components.setRequestBodyModel('Parent', sharedRequestBody)).toThrow();
    expect(() => components.setRequestBodyModel('Child', sharedRequestBody)).toThrow();
    expect(() => components.setRequestBodyModel('Child', operationRequestBody)).toThrow();

    const anotherSharedRequestBody = new RequestBody(components);
    components.setRequestBodyModel('Another', anotherSharedRequestBody);

    expect(components.requestBodies.get('Another')).toBe(anotherSharedRequestBody);
  });

  test('setRequestBody', () => {
    expect(components.requestBodies.size).toBe(2);
    expect(components.requestBodies.get('Empty')).toHaveProperty('parent', components);
    expect(components.requestBodies.get('List')).toHaveProperty('parent', components);
  });

  test('deleteRequestBody', () => {
    components.deleteRequestBody('Empty');

    expect(components.requestBodies.size).toBe(1);
    expect(components.requestBodies.get('List')).toBeTruthy();
  });

  test('clearRequestBodies', () => {
    components.clearRequestBodies();

    expect(components.requestBodies.size).toBe(0);
  });
});

describe('headers', () => {
  beforeEach(() => {
    components.setHeader('X-Language');
    components.setHeader('X-Fresha');
  });

  test('setHeaderModel logic', () => {
    const sharedHeader = components.setHeader('Req');

    const operationHeader = openapi
      .setPathItem('/')
      .setOperation('post')
      .setResponse(200, 'success')
      .setHeader('Accept');

    expect(() => components.setHeaderModel('Parent', sharedHeader)).toThrow();
    expect(() => components.setHeaderModel('Child', sharedHeader)).toThrow();
    expect(() => components.setHeaderModel('Child', operationHeader)).toThrow();

    const anotherSharedRequestBody = new RequestBody(components);
    components.setRequestBodyModel('Another', anotherSharedRequestBody);

    expect(components.requestBodies.get('Another')).toBe(anotherSharedRequestBody);
  });

  test('setHeader', () => {
    expect(components.headers.size).toBe(2);
    expect(components.headers.get('X-Language')).toHaveProperty('parent', components);
    expect(components.headers.get('X-Fresha')).toHaveProperty('parent', components);
  });

  test('deleteHeader', () => {
    components.deleteHeader('X-Language');

    expect(components.headers.size).toBe(1);
    expect(components.headers.get('X-Fresha')).toBeTruthy();
  });

  test('clearHeaders', () => {
    components.clearHeaders();

    expect(components.headers.size).toBe(0);
  });
});

describe('securitySchemes', () => {
  beforeEach(() => {
    components.setSecuritySchema('local', 'apiKey');
    components.setSecuritySchema('google', 'oauth2');
  });

  test('setSecuritySchema', () => {
    components.setSecuritySchema('httpToken', 'http');
    components.setSecuritySchema('oid', 'openIdConnect');

    expect(components.securitySchemes.size).toBe(4);

    expect(components.securitySchemes.get('local')).toHaveProperty('parent', components);
    expect(components.securitySchemes.get('local')).toHaveProperty('type', 'apiKey');

    expect(components.securitySchemes.get('google')).toHaveProperty('parent', components);
    expect(components.securitySchemes.get('google')).toHaveProperty('type', 'oauth2');

    expect(components.securitySchemes.get('httpToken')).toHaveProperty('parent', components);
    expect(components.securitySchemes.get('httpToken')).toHaveProperty('type', 'http');

    expect(components.securitySchemes.get('oid')).toHaveProperty('parent', components);
    expect(components.securitySchemes.get('oid')).toHaveProperty('type', 'openIdConnect');

    expect(() =>
      components.setSecuritySchema('schema', 'wrongType' as SecuritySchemeType),
    ).toThrow();
  });

  test('deleteSecuritySchema', () => {
    components.deleteSecuritySchema('local');

    expect(components.securitySchemes.size).toBe(1);
    expect(components.securitySchemes.get('google')).toBeTruthy();
    expect(components.securitySchemes.get('google')).toHaveProperty('type', 'oauth2');
  });

  test('clearsecuritySchemes', () => {
    components.clearSecuritySchemes();

    expect(components.securitySchemes.size).toBe(0);
  });
});

describe('links', () => {
  beforeEach(() => {
    components.setLink('Language');
    components.setLink('Fresha');
  });

  test('setLinkModel logic', () => {
    const sharedLink = components.setLink('Req');

    const responseLink = openapi
      .setPathItem('/')
      .setOperation('post')
      .setResponse(200, 'success')
      .setLink('ex1');

    expect(() => components.setLinkModel('Parent', sharedLink)).toThrow();
    expect(() => components.setLinkModel('Child', sharedLink)).toThrow();
    expect(() => components.setLinkModel('Child', responseLink)).toThrow();

    const anotherSharedLink = new Link(components);
    components.setLinkModel('Another', anotherSharedLink);

    expect(components.links.get('Another')).toBe(anotherSharedLink);
  });

  test('setLink', () => {
    expect(components.links.size).toBe(2);
    expect(components.links.get('Language')).toHaveProperty('parent', components);
    expect(components.links.get('Fresha')).toHaveProperty('parent', components);
  });

  test('deleteLink', () => {
    components.deleteLink('Language');

    expect(components.links.size).toBe(1);
    expect(components.links.get('Fresha')).toBeTruthy();
  });

  test('clearLinks', () => {
    components.clearLinks();

    expect(components.links.size).toBe(0);
  });
});

describe('callbacks', () => {
  beforeEach(() => {
    components.setCallback('Language');
    components.setCallback('Fresha');
  });

  test('setCallbackModel logic', () => {
    const sharedCallback = components.setCallback('CB');

    const operationCallback = openapi.setPathItem('/').setOperation('post').setCallback('x');

    expect(() => components.setCallbackModel('Parent', sharedCallback)).toThrow();
    expect(() => components.setCallbackModel('Child', sharedCallback)).toThrow();
    expect(() => components.setCallbackModel('Child', operationCallback)).toThrow();

    const anotherSharedCallback = new Callback(components);
    components.setCallbackModel('Another', anotherSharedCallback);

    expect(components.callbacks.get('Another')).toBe(anotherSharedCallback);
  });

  test('setCallback', () => {
    expect(components.callbacks.size).toBe(2);
    expect(components.callbacks.get('Language')).toHaveProperty('parent', components);
    expect(components.callbacks.get('Fresha')).toHaveProperty('parent', components);
  });

  test('deleteCallback', () => {
    components.deleteCallback('Language');

    expect(components.callbacks.size).toBe(1);
    expect(components.callbacks.get('Fresha')).toBeTruthy();
  });

  test('clearCallbacks', () => {
    components.clearCallbacks();

    expect(components.callbacks.size).toBe(0);
  });
});

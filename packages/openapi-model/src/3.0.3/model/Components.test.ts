import { Callback } from './Callback';
import { Example } from './Example';
import { Link } from './Link';
import { OpenAPIFactory } from './OpenAPI';
import { PathParameter, QueryParameter } from './Parameter';
import { RequestBody } from './RequestBody';
import { Response } from './Response';
import { SchemaFactory } from './Schema';

import type { ComponentsModel, OpenAPIModel } from './types';

let openapi: OpenAPIModel;
let components: ComponentsModel;

beforeEach(() => {
  openapi = OpenAPIFactory.create();
  components = openapi.components;
});

describe('schemas', () => {
  beforeEach(() => {
    components.setSchema('Integer', 'integer');
    components.setSchema('Empty');
  });

  test('getSchema + getSchemaOrThrow', () => {
    expect(components.getSchema('Integer')).not.toBeUndefined();
    expect(components.getSchema('_')).toBeUndefined();
    expect(components.getSchemaOrThrow('Empty')).not.toBeUndefined();
    expect(() => components.getSchemaOrThrow('non-existent')).toThrow();
  });

  test('setSchemaModel logic', () => {
    const parent = components.setSchema('Parent', 'object');
    const child = parent.setProperty('child', 'integer');

    expect(() => components.setSchemaModel('Parent', parent)).toThrow();
    expect(() => components.setSchemaModel('Child', parent)).toThrow();
    expect(() => components.setSchemaModel('Child', child)).toThrow();

    const other = SchemaFactory.create(components, 'binary');
    components.setSchemaModel('Other', other);

    expect(components.getSchema('Other')).toBe(other);
  });

  test('setSchema', () => {
    expect(components.schemaCount).toBe(2);

    const integerSchema = components.getSchema('Integer');
    expect(integerSchema).toHaveProperty('parent', components);

    const emptySchema = components.getSchema('Empty');
    expect(emptySchema).toHaveProperty('parent', components);

    const idStringSchema = components.setSchema('IDString', {
      type: 'string',
      nullable: false,
      minLength: 1,
    });
    expect(idStringSchema).toHaveProperty('parent', components);
    expect(idStringSchema).toHaveProperty('minLength', 1);
    expect(idStringSchema).toHaveProperty('nullable', false);
  });

  test('removeSchema', () => {
    components.deleteSchema('Empty');
    expect(Array.from(components.schemaKeys())).toStrictEqual(['Integer']);
  });

  test('clearSchemas', () => {
    components.clearSchemas();
    expect(components.schemaCount).toBe(0);
  });
});

describe('responses', () => {
  beforeEach(() => {
    components.setResponse('Success', 'Success response');
    components.setResponse('Error500', 'Error 5xx');
  });

  test('getResponse + getResponseOrThrow', () => {
    expect(components.getResponse('Success')).not.toBeUndefined();
    expect(components.getResponse('i-dont-exist')).toBeUndefined();
    expect(components.getResponseOrThrow('Error500')).not.toBeUndefined();
    expect(() => components.getResponseOrThrow('nothing-here')).toThrow();
  });

  test('setResponseModel logic', () => {
    const sharedResponse = components.setResponse('Parent', 'some response');

    const pathItemResponse = openapi
      .setPathItem('/')
      .addOperation('get')
      .setResponse(200, 'success');

    expect(() => components.setResponseModel('Parent', sharedResponse)).toThrow();
    expect(() => components.setResponseModel('Child', sharedResponse)).toThrow();
    expect(() => components.setResponseModel('Child', pathItemResponse)).toThrow();

    const anotherSharedResponse = new Response(components, 'another');
    components.setResponseModel('Another', anotherSharedResponse);

    expect(components.getResponse('Another')).toBe(anotherSharedResponse);
  });

  test('setResponse', () => {
    expect(components.responseCount).toBe(2);

    const successResponse = components.getResponse('Success');
    expect(successResponse).toHaveProperty('parent', components);

    const errorResponse = components.getResponse('Error500');
    expect(errorResponse).toHaveProperty('parent', components);
  });

  test('deleteResponse', () => {
    components.deleteResponse('Success');

    expect(Array.from(components.responseKeys())).toStrictEqual(['Error500']);
  });

  test('clearResponses', () => {
    components.clearResponses();

    expect(components.responseCount).toBe(0);
  });
});

describe('parameters', () => {
  beforeEach(() => {
    components.setParameter('ID', 'path', 'id');
    components.setParameter('Offset', 'query', 'offset');
    components.setParameter('Language', 'header', 'Language');
    components.setParameter('SessionID', 'cookie', 'session');
  });

  test('getParameter + getParameterOrThrow', () => {
    expect(components.getParameter('ID')).not.toBeUndefined();
    expect(components.getParameter('>')).toBeUndefined();
    expect(components.getParameterOrThrow('Offset')).not.toBeUndefined();
    expect(() => components.getParameterOrThrow('<')).toThrow();
  });

  test('setParameterModel logic', () => {
    const sharedParam = components.setParameter('Parent', 'path', 'id');

    const operationParam = openapi.setPathItem('/').addOperation('get').addParameter('ns', 'path');

    expect(() => components.setParameterModel('Parent', sharedParam)).toThrow();
    expect(() => components.setParameterModel('Child', sharedParam)).toThrow();
    expect(() => components.setParameterModel('Child', operationParam)).toThrow();

    const anotherSharedParam = new PathParameter(components, 'another');
    components.setParameterModel('Another', anotherSharedParam);

    expect(components.getParameter('Another')).toBe(anotherSharedParam);
  });

  test('setParameter', () => {
    expect(components.parameterCount).toBe(4);

    const idParam = components.getParameter('ID');
    expect(idParam).toHaveProperty('parent', components);
    expect(idParam).toHaveProperty('in', 'path');
    expect(idParam).toHaveProperty('name', 'id');

    const offsetParam = components.getParameter('Offset');
    expect(offsetParam).toHaveProperty('parent', components);
    expect(offsetParam).toHaveProperty('in', 'query');
    expect(offsetParam).toHaveProperty('name', 'offset');

    const languageParam = components.getParameter('Language');
    expect(languageParam).toHaveProperty('parent', components);
    expect(languageParam).toHaveProperty('in', 'header');
    expect(languageParam).toHaveProperty('name', 'Language');

    const sessionParam = components.getParameter('SessionID');
    expect(sessionParam).toHaveProperty('parent', components);
    expect(sessionParam).toHaveProperty('in', 'cookie');
    expect(sessionParam).toHaveProperty('name', 'session');

    expect(() => components.setParameter('key', 'kookie' as 'cookie', 'wrong')).toThrow();
  });

  test('deleteParameter', () => {
    components.deleteParameter('ID');

    expect(components.parameterCount).toBe(3);

    expect(Array.from(components.parameterKeys())).toStrictEqual([
      'Offset',
      'Language',
      'SessionID',
    ]);
  });

  test('clearParameters', () => {
    components.clearParameters();

    expect(components.parameterCount).toBe(0);
  });
});

describe('examples', () => {
  beforeEach(() => {
    components.setExample('Success');
    components.setExample('Error');
  });

  test('getExample + getExampleOrThrow', () => {
    expect(components.getExample('Success')).not.toBeUndefined();
    expect(components.getExample('?')).toBeUndefined();
    expect(components.getExampleOrThrow('Error')).not.toBeUndefined();
    expect(() => components.getExampleOrThrow('?')).toThrow();
  });

  test('setExampleModel logic', () => {
    const sharedExample = components.setExample('Parent');

    const pathItemExample = new Example(new QueryParameter(openapi.setPathItem('/x/{id}'), 'q'));

    expect(() => components.setExampleModel('Parent', sharedExample)).toThrow();
    expect(() => components.setExampleModel('Child', sharedExample)).toThrow();
    expect(() => components.setExampleModel('Child', pathItemExample)).toThrow();

    const anotherSharedExample = new Example(components);
    components.setExampleModel('Another', anotherSharedExample);

    expect(components.getExample('Another')).toBe(anotherSharedExample);
  });

  test('setExample', () => {
    expect(components.exampleCount).toBe(2);
    expect(components.getExample('Success')).toHaveProperty('parent', components);
    expect(components.getExample('Error')).toHaveProperty('parent', components);
  });

  test('deleteExample', () => {
    components.deleteExample('Success');

    expect(components.exampleCount).toBe(1);
    expect(components.getExample('Error')).toBeTruthy();
  });

  test('clearExamples', () => {
    components.clearExamples();

    expect(components.exampleCount).toBe(0);
  });
});

describe('requestBodies', () => {
  beforeEach(() => {
    components.setRequestBody('Empty');
    components.setRequestBody('List');
  });

  test('getRequestBody + getRequestBodyOrThrow', () => {
    expect(components.getRequestBody('List')).not.toBeUndefined();
    expect(components.getRequestBody('_')).toBeUndefined();
    expect(components.getRequestBodyOrThrow('Empty')).not.toBeUndefined();
    expect(() => components.getRequestBodyOrThrow('?')).toThrow();
  });

  test('setRequestBodyModel logic', () => {
    const sharedRequestBody = components.setRequestBody('Req');

    const operation = openapi.setPathItem('/').addOperation('post');
    const operationRequestBody = new RequestBody(operation);

    expect(() => components.setRequestBodyModel('Parent', sharedRequestBody)).toThrow();
    expect(() => components.setRequestBodyModel('Child', sharedRequestBody)).toThrow();
    expect(() => components.setRequestBodyModel('Child', operationRequestBody)).toThrow();

    const anotherSharedRequestBody = new RequestBody(components);
    components.setRequestBodyModel('Another', anotherSharedRequestBody);

    expect(components.getRequestBody('Another')).toBe(anotherSharedRequestBody);
  });

  test('setRequestBody', () => {
    expect(components.requestBodyCount).toBe(2);
    expect(components.getRequestBody('Empty')).toHaveProperty('parent', components);
    expect(components.getRequestBody('List')).toHaveProperty('parent', components);
  });

  test('deleteRequestBody', () => {
    components.deleteRequestBody('Empty');

    expect(components.requestBodyCount).toBe(1);
    expect(components.getRequestBody('List')).toBeTruthy();
  });

  test('clearRequestBodies', () => {
    components.clearRequestBodies();

    expect(components.requestBodyCount).toBe(0);
  });
});

describe('headers', () => {
  beforeEach(() => {
    components.setHeader('X-Language');
    components.setHeader('X-Fresha');
  });

  test('getHeader + getHeaderOrThrow', () => {
    expect(components.getHeader('X-Fresha')).not.toBeUndefined();
    expect(components.getHeader('_')).toBeUndefined();
    expect(components.getHeaderOrThrow('X-Language')).not.toBeUndefined();
    expect(() => components.getHeaderOrThrow('?')).toThrow();
  });

  test('setHeaderModel logic', () => {
    const sharedHeader = components.setHeader('Req');

    const operationHeader = openapi
      .setPathItem('/')
      .addOperation('post')
      .setResponse(200, 'success')
      .setHeader('Accept');

    expect(() => components.setHeaderModel('Parent', sharedHeader)).toThrow();
    expect(() => components.setHeaderModel('Child', sharedHeader)).toThrow();
    expect(() => components.setHeaderModel('Child', operationHeader)).toThrow();

    const anotherSharedRequestBody = new RequestBody(components);
    components.setRequestBodyModel('Another', anotherSharedRequestBody);

    expect(components.getRequestBody('Another')).toBe(anotherSharedRequestBody);
  });

  test('setHeader', () => {
    expect(components.headerCount).toBe(2);
    expect(components.getHeader('X-Language')).toHaveProperty('parent', components);
    expect(components.getHeader('X-Fresha')).toHaveProperty('parent', components);
  });

  test('deleteHeader', () => {
    components.deleteHeader('X-Language');

    expect(components.headerCount).toBe(1);
    expect(components.getHeader('X-Fresha')).toBeTruthy();
  });

  test('clearHeaders', () => {
    components.clearHeaders();

    expect(components.headerCount).toBe(0);
  });
});

describe('securitySchemes', () => {
  beforeEach(() => {
    components.setSecuritySchema('local', 'apiKey');
    components.setSecuritySchema('google', 'oauth2');
  });

  test('getSecuritySchema + getSecuritySchemaOrThrow', () => {
    expect(components.getSecuritySchema('local')).not.toBeUndefined();
    expect(components.getSecuritySchema('_')).toBeUndefined();
    expect(components.getSecuritySchemaOrThrow('google')).not.toBeUndefined();
    expect(() => components.getSecuritySchemaOrThrow('?')).toThrow();
  });

  test('setSecuritySchema', () => {
    components.setSecuritySchema('httpToken', 'http', 'digest');
    components.setSecuritySchema('oid', 'openIdConnect', 'https://openid.example.com/');

    expect(components.securitySchemaCount).toBe(4);

    expect(components.getSecuritySchema('local')).toHaveProperty('parent', components);
    expect(components.getSecuritySchema('local')).toHaveProperty('type', 'apiKey');

    expect(components.getSecuritySchema('google')).toHaveProperty('parent', components);
    expect(components.getSecuritySchema('google')).toHaveProperty('type', 'oauth2');

    expect(components.getSecuritySchema('httpToken')).toHaveProperty('parent', components);
    expect(components.getSecuritySchema('httpToken')).toHaveProperty('type', 'http');

    expect(components.getSecuritySchema('oid')).toHaveProperty('parent', components);
    expect(components.getSecuritySchema('oid')).toHaveProperty('type', 'openIdConnect');

    expect(() =>
      components.setSecuritySchema('schema', 'wrongTypeInDisguise' as 'apiKey'),
    ).toThrow();
  });

  test('deleteSecuritySchema', () => {
    components.deleteSecuritySchema('local');

    expect(components.securitySchemaCount).toBe(1);
    expect(components.getSecuritySchema('google')).toBeTruthy();
    expect(components.getSecuritySchema('google')).toHaveProperty('type', 'oauth2');
  });

  test('clearsecuritySchemes', () => {
    components.clearSecuritySchemes();

    expect(components.securitySchemaCount).toBe(0);
  });
});

describe('links', () => {
  beforeEach(() => {
    components.setLink('Language');
    components.setLink('Fresha');
  });

  test('getLink + getLinkOrThrow', () => {
    expect(components.getLink('Language')).not.toBeUndefined();
    expect(components.getLink('_')).toBeUndefined();
    expect(components.getLinkOrThrow('Fresha')).not.toBeUndefined();
    expect(() => components.getLinkOrThrow('?')).toThrow();
  });

  test('setLinkModel logic', () => {
    const sharedLink = components.setLink('Req');

    const responseLink = openapi
      .setPathItem('/')
      .addOperation('post')
      .setResponse(200, 'success')
      .setLink('ex1');

    expect(() => components.setLinkModel('Parent', sharedLink)).toThrow();
    expect(() => components.setLinkModel('Child', sharedLink)).toThrow();
    expect(() => components.setLinkModel('Child', responseLink)).toThrow();

    const anotherSharedLink = new Link(components);
    components.setLinkModel('Another', anotherSharedLink);

    expect(components.getLink('Another')).toBe(anotherSharedLink);
  });

  test('setLink', () => {
    expect(components.linkCount).toBe(2);
    expect(components.getLink('Language')).toHaveProperty('parent', components);
    expect(components.getLink('Fresha')).toHaveProperty('parent', components);
  });

  test('deleteLink', () => {
    components.deleteLink('Language');

    expect(components.linkCount).toBe(1);
    expect(components.getLink('Fresha')).toBeTruthy();
  });

  test('clearLinks', () => {
    components.clearLinks();

    expect(components.linkCount).toBe(0);
  });
});

describe('callbacks', () => {
  beforeEach(() => {
    components.setCallback('Language');
    components.setCallback('Fresha');
  });

  test('getCallback + getCallbackOrThrow', () => {
    expect(components.getCallback('Language')).not.toBeUndefined();
    expect(components.getCallback('_')).toBeUndefined();
    expect(components.getCallbackOrThrow('Fresha')).not.toBeUndefined();
    expect(() => components.getCallbackOrThrow('?')).toThrow();
  });

  test('setCallbackModel logic', () => {
    const sharedCallback = components.setCallback('CB');

    const operationCallback = openapi.setPathItem('/').addOperation('post').setCallback('x');

    expect(() => components.setCallbackModel('Parent', sharedCallback)).toThrow();
    expect(() => components.setCallbackModel('Child', sharedCallback)).toThrow();
    expect(() => components.setCallbackModel('Child', operationCallback)).toThrow();

    const anotherSharedCallback = new Callback(components);
    components.setCallbackModel('Another', anotherSharedCallback);

    expect(components.getCallback('Another')).toBe(anotherSharedCallback);
  });

  test('setCallback', () => {
    expect(components.callbackCount).toBe(2);
    expect(components.getCallback('Language')).toHaveProperty('parent', components);
    expect(components.getCallback('Fresha')).toHaveProperty('parent', components);
  });

  test('deleteCallback', () => {
    components.deleteCallback('Language');

    expect(components.callbackCount).toBe(1);
    expect(components.getCallback('Fresha')).toBeTruthy();
  });

  test('clearCallbacks', () => {
    components.clearCallbacks();

    expect(components.callbackCount).toBe(0);
  });
});

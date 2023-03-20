import { OpenAPIFactory } from './OpenAPI';

let openapi = OpenAPIFactory.create();

beforeEach(() => {
  openapi = OpenAPIFactory.create();
});

test('default properties', () => {
  const operation = openapi.setPathItem('/').addOperation('post');
  expect(operation.tags).toHaveLength(0);
  expect(operation.summary).toBeNull();
  expect(operation.description).toBeNull();
  expect(operation.operationId).toBeNull();
  expect(operation.parameterCount).toBe(0);
  expect(operation.requestBody).toBeNull();
  expect(operation.responses.default).toBeNull();
  expect(operation.responses.responseCount).toBe(0);
  expect(operation.callbackCount).toBe(0);
  expect(operation.deprecated).toBeFalsy();
  expect(operation.effectiveSecurityRequirementCount).toBe(0);
  expect(operation.securityRequirementCount).toBeUndefined();
  expect(operation.securityRequirements()).toBeUndefined();
  expect(operation.serverCount).toBe(0);
});

test('httpMethod property', () => {
  const pathItem = openapi.setPathItem('/hello');
  const op1 = pathItem.addOperation('post');
  const op2 = pathItem.addOperation('delete');

  expect(op1.httpMethod).toBe('post');
  expect(op2.httpMethod).toBe('delete');
});

test('tags collection', () => {
  const operation = openapi.setPathItem('/').addOperation('head');

  openapi.addTag('tag1');
  openapi.addTag('tag2');

  operation.addTag('tag1');
  expect(Array.from(operation.tags())).toStrictEqual(['tag1']);

  expect(() => operation.addTag('nonExistentTag')).toThrow();

  openapi.addTag('tag3');
  operation.addTag('tag3');

  operation.deleteTag('tag2');
  operation.deleteTag('tag2');
  operation.deleteTag('tag4');
  expect(Array.from(operation.tags())).toStrictEqual(['tag1', 'tag3']);

  operation.deleteTag('tag3');
  expect(Array.from(operation.tags())).toStrictEqual(['tag1']);

  operation.addTag('tag3');
  operation.deleteTagAt(0);
  expect(Array.from(operation.tags())).toStrictEqual(['tag3']);

  operation.clearTags();
  expect(operation.tagCount).toBe(0);
});

test('parameters collection', () => {
  const operation = openapi.setPathItem('/').addOperation('put');

  const p1 = operation.addParameter('p1', 'path');
  const p2 = operation.addParameter('p2', 'query');
  const p3 = operation.addParameter('p3', 'header');
  const p4 = operation.addParameter('p4', 'cookie');

  expect(() => operation.addParameter('p5', 'illegalLocation' as 'cookie')).toThrow();

  expect(Array.from(operation.parameters())).toStrictEqual([p1, p2, p3, p4]);

  expect(operation.getParameter('p1', 'path')).not.toBeUndefined();
  expect(operation.getParameter('p1', 'query')).toBeUndefined();
  expect(operation.getParameter('p5', 'path')).toBeUndefined();
  expect(operation.getParameterOrThrow('p3', 'header')).not.toBeUndefined();
  expect(() => operation.getParameterOrThrow('p1', 'query')).toThrow();
  expect(() => operation.getParameterOrThrow('p5', 'cookie')).toThrow();

  expect(() => operation.addParameter('p1', 'path')).toThrow();
  expect(() => operation.addParameter('p1', 'cookie')).toThrow();

  operation.deleteParameter('p3');
  expect(Array.from(operation.parameters())).toStrictEqual([p1, p2, p4]);

  operation.clearParameters();
  expect(Array.from(operation.parameters())).toHaveLength(0);
});

test('request body', () => {
  const operation = openapi.setPathItem('/').addOperation('head');

  const requestBody = operation.setRequestBody();
  expect(operation.requestBody).toBe(requestBody);

  expect(() => operation.setRequestBody()).toThrow();

  operation.deleteRequestBody();
  expect(operation.requestBody).toBeNull();
});

test('delegated response methods', () => {
  const operation = openapi.setPathItem('/').addOperation('head');

  const res1 = operation.setDefaultResponse('success');
  expect(operation.responses.default).toBe(res1);

  operation.deleteDefaultResponse();
  expect(operation.responses.default).toBeNull();

  const res200 = operation.setResponse(200, 'success');
  const res404 = operation.setResponse(404, 'not found');
  expect(operation.responses.responseCount).toBe(2);
  expect(operation.responses.getResponse(200)).toBe(res200);
  expect(operation.responses.getResponse(404)).toBe(res404);

  expect(operation.getResponse(200)).not.toBeUndefined();
  expect(operation.getResponse(418)).toBeUndefined();
  expect(operation.getResponseOrThrow(404)).not.toBeUndefined();
  expect(() => operation.getResponseOrThrow(501)).toThrow();

  operation.deleteResponse(404);
  expect(operation.responses.getResponse(404)).toBeUndefined();

  operation.clearResponses();
  expect(operation.responses.responseCount).toBe(0);
});

test('callbacks collection', () => {
  const operation = openapi.setPathItem('/').addOperation('delete');

  operation.setCallback('cb1');
  operation.setCallback('cb2');

  expect(operation.callbackCount).toBe(2);

  expect(operation.getCallback('cb1')).not.toBeUndefined();
  expect(operation.getCallback('-')).toBeUndefined();
  expect(operation.getCallbackOrThrow('cb2')).not.toBeUndefined();
  expect(() => operation.getCallbackOrThrow('?')).toThrow();

  operation.deleteCallback('cb1');

  expect(operation.getCallback('cb1')).not.toBeDefined();

  operation.clearCallbacks();

  expect(operation.callbackCount).toBe(0);
});

describe('security requirements', () => {
  test('collection of own requirements', () => {
    const operation = openapi.setPathItem('/x').addOperation('patch');

    const s1 = operation.addSecurityRequirement();
    operation.addSecurityRequirement();
    const s3 = operation.addSecurityRequirement();

    expect(operation.securityRequirementCount).toBe(3);

    operation.deleteSecurityRequirementAt(1);
    expect(operation.securityRequirementCount).toBe(2);
    expect(operation.securityRequirementAt(0)).toBe(s1);
    expect(operation.securityRequirementAt(1)).toBe(s3);

    operation.clearSecurityRequirements();
    expect(operation.securityRequirementCount).toBe(0);
  });

  test('inherits requirements from openapi', () => {
    openapi.components.setSecuritySchema('global', 'apiKey');
    openapi.addSecurityRequirement().addSchema('global');

    const operation = openapi.setPathItem('/items').addOperation('get');

    expect(operation.effectiveSecurityRequirementCount).toBe(1);
    expect(
      Array.from(operation.effectiveSecurityRequirements(), req => Array.from(req.schemaNames())),
    ).toStrictEqual([['global']]);
  });

  test('overrides requirements defined globally', () => {
    openapi.components.setSecuritySchema('global', 'apiKey');
    openapi.components.setSecuritySchema('custom', 'http');
    openapi.addSecurityRequirement().addSchema('global');

    const operation = openapi.setPathItem('/items').addOperation('get');
    operation.addSecurityRequirement().addSchema('custom');

    expect(operation.effectiveSecurityRequirementCount).toBe(1);
    expect(
      Array.from(operation.effectiveSecurityRequirements(), req => Array.from(req.schemaNames())),
    ).toStrictEqual([['custom']]);
  });

  test('disables globally defined requirements', () => {
    openapi.components.setSecuritySchema('global', 'apiKey');
    openapi.components.setSecuritySchema('custom', 'http');
    openapi.addSecurityRequirement().addSchema('global');

    const operation = openapi.setPathItem('/items').addOperation('get');
    operation.addSecurityRequirement().addSchema('custom');
    operation.clearSecurityRequirements(); // this resets own requirements

    expect(operation.effectiveSecurityRequirementCount).toBe(0);
    expect(
      Array.from(operation.effectiveSecurityRequirements(), req => Array.from(req.schemaNames())),
    ).toStrictEqual([]);
  });
});

test('servers collection', () => {
  const operation = openapi.setPathItem('/').addOperation('post');

  const s1 = operation.addServer('http://first.example.com');
  const s2 = operation.addServer('http://second.example.com');
  operation.addServer('http://third.example.com');

  expect(() => operation.addServer('http://second.example.com')).toThrow();

  expect(operation.serverCount).toBe(3);

  expect(operation.getServer('http://first.example.com')).not.toBeUndefined();
  expect(operation.getServer('-')).toBeUndefined();
  expect(operation.getServerOrThrow('http://second.example.com')).not.toBeUndefined();
  expect(() => operation.getServerOrThrow('?')).toThrow();

  operation.deleteServer('http://third.example.com');
  expect(operation.serverCount).toBe(2);
  expect(operation.serverAt(0)).toBe(s1);

  operation.deleteServerAt(0);
  expect(operation.serverCount).toBe(1);
  expect(operation.serverAt(0)).toBe(s2);

  operation.clearServers();
  expect(operation.serverCount).toBe(0);
});

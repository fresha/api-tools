import { OpenAPIFactory } from './OpenAPI';

let openapi = OpenAPIFactory.create();

beforeEach(() => {
  openapi = OpenAPIFactory.create();
});

test('default properties', () => {
  const operation = openapi.setPathItem('/').setOperation('post');
  expect(operation.tags).toHaveLength(0);
  expect(operation.summary).toBeNull();
  expect(operation.description).toBeNull();
  expect(operation.operationId).toBeNull();
  expect(operation.parameters).toHaveLength(0);
  expect(operation.requestBody).toBeNull();
  expect(operation.responses.default).toBeNull();
  expect(operation.responses.codes.size).toBe(0);
  expect(operation.callbacks.size).toBe(0);
  expect(operation.deprecated).toBeFalsy();
  expect(operation.security).toHaveLength(0);
  expect(operation.servers).toHaveLength(0);
});

test('tags collection', () => {
  const operation = openapi.setPathItem('/').setOperation('head');

  openapi.addTag('tag1');
  openapi.addTag('tag2');

  operation.addTag('tag1');
  expect(operation.tags).toStrictEqual(['tag1']);

  expect(() => operation.addTag('nonExistentTag')).toThrow();

  openapi.addTag('tag3');
  operation.addTag('tag3');

  operation.deleteTag('tag2');
  operation.deleteTag('tag2');
  operation.deleteTag('tag4');
  expect(operation.tags).toStrictEqual(['tag1', 'tag3']);

  operation.deleteTagAt(0);
  expect(operation.tags).toStrictEqual(['tag3']);

  operation.clearTags();
  expect(operation.tags).toHaveLength(0);
});

test('parameters collection', () => {
  const operation = openapi.setPathItem('/').setOperation('put');

  const p1 = operation.addParameter('p1', 'path');
  const p2 = operation.addParameter('p2', 'query');
  const p3 = operation.addParameter('p3', 'header');
  const p4 = operation.addParameter('p4', 'cookie');

  expect(() => operation.addParameter('p5', 'illegalLocation' as 'cookie')).toThrow();

  expect(operation.parameters).toStrictEqual([p1, p2, p3, p4]);

  expect(operation.getParameter('p1', 'path')).not.toBeUndefined();
  expect(operation.getParameter('p1', 'query')).toBeUndefined();
  expect(operation.getParameter('p5', 'path')).toBeUndefined();
  expect(operation.getParameterOrThrow('p3', 'header')).not.toBeUndefined();
  expect(() => operation.getParameterOrThrow('p1', 'query')).toThrow();
  expect(() => operation.getParameterOrThrow('p5', 'cookie')).toThrow();

  expect(() => operation.addParameter('p1', 'path')).toThrow();
  expect(() => operation.addParameter('p1', 'cookie')).toThrow();

  operation.deleteParameter('p3');
  expect(operation.parameters).toStrictEqual([p1, p2, p4]);

  operation.clearParameters();
  expect(operation.parameters).toHaveLength(0);
});

test('request body', () => {
  const operation = openapi.setPathItem('/').setOperation('head');

  const requestBody = operation.setRequestBody();
  expect(operation.requestBody).toBe(requestBody);

  expect(() => operation.setRequestBody()).toThrow();

  operation.deleteRequestBody();
  expect(operation.requestBody).toBeNull();
});

test('delegated response methods', () => {
  const operation = openapi.setPathItem('/').setOperation('head');

  const res1 = operation.setDefaultResponse('success');
  expect(operation.responses.default).toBe(res1);

  operation.deleteDefaultResponse();
  expect(operation.responses.default).toBeNull();

  const res200 = operation.setResponse(200, 'success');
  const res404 = operation.setResponse(404, 'not found');
  expect(operation.responses.codes.size).toBe(2);
  expect(operation.responses.codes.get(200)).toBe(res200);
  expect(operation.responses.codes.get(404)).toBe(res404);

  expect(operation.getResponse(200)).not.toBeUndefined();
  expect(operation.getResponse(418)).toBeUndefined();
  expect(operation.getResponseOrThrow(404)).not.toBeUndefined();
  expect(() => operation.getResponseOrThrow(501)).toThrow();

  operation.deleteResponse(404);
  expect(operation.responses.codes.get(404)).toBeUndefined();

  operation.clearResponses();
  expect(operation.responses.codes.size).toBe(0);
});

test('callbacks collection', () => {
  const operation = openapi.setPathItem('/').setOperation('delete');

  operation.setCallback('cb1');
  operation.setCallback('cb2');

  expect(operation.callbacks.size).toBe(2);

  expect(operation.getCallback('cb1')).not.toBeUndefined();
  expect(operation.getCallback('-')).toBeUndefined();
  expect(operation.getCallbackOrThrow('cb2')).not.toBeUndefined();
  expect(() => operation.getCallbackOrThrow('?')).toThrow();

  operation.deleteCallback('cb1');

  expect(operation.callbacks.get('cb1')).not.toBeDefined();

  operation.clearCallbacks();

  expect(operation.callbacks.size).toBe(0);
});

test('security requirement collection', () => {
  const operation = openapi.setPathItem('/x').setOperation('patch');

  const s1 = operation.addSecurityRequirement();
  operation.addSecurityRequirement();
  const s3 = operation.addSecurityRequirement();

  expect(operation.security).toHaveLength(3);

  operation.deleteSecurityRequirementAt(1);
  expect(operation.security).toHaveLength(2);
  expect(operation.security[0]).toBe(s1);
  expect(operation.security[1]).toBe(s3);

  operation.clearSecurityRequirements();
  expect(operation.security).toHaveLength(0);
});

test('servers collection', () => {
  const operation = openapi.setPathItem('/').setOperation('post');

  const s1 = operation.addServer('http://first.example.com');
  const s2 = operation.addServer('http://second.example.com');
  operation.addServer('http://third.example.com');

  expect(() => operation.addServer('http://second.example.com')).toThrow();

  expect(operation.servers.length).toBe(3);

  expect(operation.getServer('http://first.example.com')).not.toBeUndefined();
  expect(operation.getServer('-')).toBeUndefined();
  expect(operation.getServerOrThrow('http://second.example.com')).not.toBeUndefined();
  expect(() => operation.getServerOrThrow('?')).toThrow();

  operation.deleteServer('http://third.example.com');
  expect(operation.servers.length).toBe(2);
  expect(operation.servers[0]).toBe(s1);

  operation.deleteServerAt(0);
  expect(operation.servers.length).toBe(1);
  expect(operation.servers[0]).toBe(s2);

  operation.clearServers();
  expect(operation.servers).toHaveLength(0);
});

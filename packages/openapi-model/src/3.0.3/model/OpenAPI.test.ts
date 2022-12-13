import { OpenAPI } from './OpenAPI';

let openapi: OpenAPI = {} as OpenAPI;

beforeEach(() => {
  openapi = new OpenAPI('example', '0.1.0');
});

test('ownership', () => {
  expect(openapi.root).toBe(openapi);
  expect(openapi.info.parent).toBe(openapi);
  expect(openapi.info.contact.parent).toBe(openapi.info);
  expect(openapi.info.license.parent).toBe(openapi.info);
});

describe('extensions', () => {
  test('getExtension + getExtensionOrThrow', () => {
    openapi.setExtension('a', 1);
    openapi.setExtension('b', 'log');

    expect(openapi.getExtension('a')).not.toBeUndefined();
    expect(openapi.getExtension('')).toBeUndefined();
    expect(openapi.getExtensionOrThrow('b')).not.toBeUndefined();
    expect(() => openapi.getExtensionOrThrow('')).toThrow();
  });

  test('mutation', () => {
    openapi.setExtension('a', 1);
    openapi.setExtension('b', '1234');

    openapi.deleteExtension('b');
    expect(openapi.getExtension('b')).toBeUndefined();

    openapi.clearExtensions();
    expect(openapi.getExtension('a')).toBeUndefined();
  });
});

describe('server collection', () => {
  test('getServer + getServerOrThrow', () => {
    const server1 = openapi.addServer('https://api1.example.com');
    const server2 = openapi.addServer('https://api2.example.com');

    expect(openapi.getServer('https://api1.example.com')).toBe(server1);
    expect(openapi.getServer('https://api3.example.com')).toBeUndefined();

    expect(openapi.getServerOrThrow('https://api2.example.com')).toBe(server2);
    expect(() => openapi.getServerOrThrow('https://api3.example.com')).toThrow();
  });

  test('mutation', () => {
    openapi.addServer('http://www.example.com');
    openapi.addServer('http://www.example.com/2');
    openapi.addServer('http://www.example.com/3');
    openapi.addServer('http://www.example.com/4');
    expect(() => openapi.addServer('http://www.example.com')).toThrow();

    openapi.removeServerAt(2);
    expect(openapi.servers.map(s => s.url)).toStrictEqual([
      'http://www.example.com',
      'http://www.example.com/2',
      'http://www.example.com/4',
    ]);

    openapi.clearServers();
    expect(openapi.servers.map(s => s.url)).toStrictEqual([]);
  });
});

describe('path items collection', () => {
  test('getPathItem + getPathItemOrThrow', () => {
    const pathItem1 = openapi.setPathItem('/item1');
    const pathItem2 = openapi.setPathItem('/item2');

    expect(openapi.getPathItem('/item1')).toBe(pathItem1);
    expect(openapi.getPathItem('/')).toBeUndefined();

    expect(openapi.getPathItemOrThrow('/item2')).toBe(pathItem2);
    expect(() => openapi.getPathItemOrThrow('/item3')).toThrow();
  });

  test('mutations', () => {
    openapi.setPathItem('/hello/{id}');
    expect(() => openapi.setPathItem('/hello/{id}')).toThrow();
    openapi.setPathItem('/hello/{other_id}');

    openapi.clearPathItems();

    expect(openapi.paths.size).toBe(0);
  });
});

describe('security requirements', () => {
  test('mutations', () => {
    const req1 = openapi.addSecurityRequirement();
    const req2 = openapi.addSecurityRequirement();
    const req3 = openapi.addSecurityRequirement();

    expect(openapi.security).toStrictEqual([req1, req2, req3]);

    openapi.deleteSecurityRequirementAt(1);
    expect(openapi.security).toStrictEqual([req1, req3]);

    openapi.clearSecurityRequirements();
    expect(openapi.security).toStrictEqual([]);
  });
});

describe('tags collection', () => {
  test('getTag + getTagOrThrow', () => {
    const tag1 = openapi.addTag('t1');
    const tag2 = openapi.addTag('t2');

    expect(openapi.getTag('t1')).toBe(tag1);
    expect(openapi.getTag('t3')).toBeUndefined();

    expect(openapi.getTagOrThrow('t2')).toBe(tag2);
    expect(() => openapi.getTagOrThrow('t3')).toThrow();
  });

  test('mutations', () => {
    openapi.addTag('t1');
    openapi.addTag('t2');
    openapi.addTag('t3');

    expect(() => openapi.addTag('t1')).toThrow();

    openapi.deleteTagAt(1);
    expect(openapi.tags.map(t => t.name)).toStrictEqual(['t1', 't3']);

    openapi.deleteTag('t1');
    expect(openapi.tags.map(t => t.name)).toStrictEqual(['t3']);

    openapi.clearTags();
    expect(openapi.tags.map(t => t.name)).toStrictEqual([]);
  });
});

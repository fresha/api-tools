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

describe('server collection', () => {
  test('getServer + getServerOrThrow', () => {
    const server1 = openapi.addServer('https://api1.example.com');
    const server2 = openapi.addServer('https://api2.example.com');

    expect(openapi.getServer('https://api1.example.com')).toBe(server1);
    expect(openapi.getServer('https://api3.example.com')).toBeUndefined();

    expect(openapi.getServerOrThrow('https://api2.example.com')).toBe(server2);
    expect(() => openapi.getServerOrThrow('https://api3.example.com')).toThrow();
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
});

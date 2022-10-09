import { OpenAPI } from './OpenAPI';
import { Server } from './Server';

let openapi: OpenAPI;

beforeEach(() => {
  openapi = new OpenAPI('Server.test', '1.2.4');
});

describe('constructor', () => {
  test('no variables', () => {
    const server = new Server(openapi, 'https://www.example.com');
    expect(server.url).toBe('https://www.example.com');
    expect(server.variables.size).toBe(0);
  });

  test('with variables', () => {
    const server = new Server(openapi, 'https://www.{hostName}.com/{path}/{subPath}');
    expect(server.url).toBe('https://www.{hostName}.com/{path}/{subPath}');
    expect(server.variables.size).toBe(3);
    expect(server.variables.get('hostName')).toBeTruthy();
    expect(server.variables.get('path')).toBeTruthy();
    expect(server.variables.get('subPath')).toBeTruthy();
  });
});

test('getVariable + getVariableOrThrow', () => {
  const server = new Server(openapi, 'https://www.example.com/{a}/{b}');
  expect(server.getVariable('a')).not.toBeUndefined();
  expect(server.getVariable('_')).toBeUndefined();
  expect(server.getVariableOrThrow('b')).not.toBeUndefined();
  expect(() => server.getVariableOrThrow('_')).toThrow();
});

test('changing server URL also updates variable map', () => {
  const server = new Server(openapi, 'https://www.{hostName}.com/{pathName}');
  server.variables.get('pathName')!.default = '/a/b/c';

  const mockHostName = jest.fn();
  server.variables.get('hostName')!.dispose = mockHostName;
  const mockPathName = jest.fn();
  server.variables.get('pathName')!.dispose = mockPathName;

  server.url = 'https://www.{host}.com/{pathName}/{subPath}';
  expect(server.variables.size).toBe(3);
  expect(server.variables.get('host')).toBeTruthy();
  expect(server.variables.get('pathName')).toBeTruthy();
  expect(server.variables.get('pathName')?.default).toBe('/a/b/c');
  expect(server.variables.get('subPath')).toBeTruthy();
  expect(mockHostName).toHaveBeenCalled();
  expect(mockPathName).not.toHaveBeenCalled();
});

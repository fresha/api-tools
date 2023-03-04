import { OpenAPI } from './OpenAPI';
import { Server } from './Server';
import { ServerVariable } from './ServerVariable';

let openapi: OpenAPI;

beforeEach(() => {
  openapi = new OpenAPI('Server.test', '1.2.4');
});

describe('constructor', () => {
  test('no variables', () => {
    const server = new Server(openapi, 'https://www.example.com');
    expect(server.url).toBe('https://www.example.com');
    expect(server.variableCount).toBe(0);
  });

  test('with variables', () => {
    const server = new Server(openapi, 'https://www.{hostName}.com/{path}/{subPath}');
    expect(server.url).toBe('https://www.{hostName}.com/{path}/{subPath}');
    expect(server.variableCount).toBe(3);
    expect(server.getVariable('hostName')).toBeTruthy();
    expect(server.getVariable('path')).toBeTruthy();
    expect(server.getVariable('subPath')).toBeTruthy();
  });
});

test('getVariable + getVariableOrThrow', () => {
  const server = new Server(openapi, 'https://www.example.com/{a}/{b}');
  expect(server.getVariable('a')).not.toBeUndefined();
  expect(server.getVariable('_')).toBeUndefined();
  expect(server.getVariableOrThrow('b')).toBeInstanceOf(ServerVariable);
  expect(() => server.getVariableOrThrow('_')).toThrow();
});

test('changing server URL also updates variable map', () => {
  const server = new Server(openapi, 'https://www.{hostName}.com/{pathName}');
  server.getVariable('pathName')!.defaultValue = '/a/b/c';

  const mockHostName = jest.fn();
  server.getVariable('hostName')!.dispose = mockHostName;
  const mockPathName = jest.fn();
  server.getVariable('pathName')!.dispose = mockPathName;

  server.url = 'https://www.{host}.com/{pathName}/{subPath}';
  expect(server.variableCount).toBe(3);
  expect(server.getVariable('host')).toBeTruthy();
  expect(server.getVariable('pathName')).toBeTruthy();
  expect(server.getVariable('pathName')?.defaultValue).toBe('/a/b/c');
  expect(server.getVariable('subPath')).toBeTruthy();
  expect(mockHostName).toHaveBeenCalled();
  expect(mockPathName).not.toHaveBeenCalled();
});

import { OpenAPIFactory } from './OpenAPI';

import type { ServerVariable } from './ServerVariable';

let serverVariable: ServerVariable;

beforeEach(() => {
  const openapi = OpenAPIFactory.create();
  const server = openapi.addServer('https://www.example.com/{version}');
  serverVariable = server.getVariableOrThrow('version') as ServerVariable;
});

test('allowed values', () => {
  expect(serverVariable.allowedValueCount).toBe(0);

  serverVariable.addAllowedValues('1.0', '1.1');

  expect(serverVariable.allowedValueCount).toBe(2);
  expect([...serverVariable.allowedValues()]).toStrictEqual(['1.0', '1.1']);
  expect(serverVariable.hasAllowedValue('1.0')).toBe(true);
  expect(serverVariable.hasAllowedValue('1.2')).toBe(false);

  serverVariable.deleteAllowedValues('1.1', '1.4');
  expect(serverVariable.allowedValueCount).toBe(1);

  serverVariable.clearAllowedValues();
  expect(serverVariable.allowedValueCount).toBe(0);
});

test('default value', () => {
  serverVariable.defaultValue = 'can set becase the list of allowed values is empty';
  expect(serverVariable.defaultValue).not.toBe('');

  serverVariable.addAllowedValues('1.5');
  expect(() => {
    serverVariable.defaultValue = '1.0';
  }).toThrow();

  serverVariable.addAllowedValues('1.1', '1.2');
  serverVariable.defaultValue = '1.1';

  expect(serverVariable.defaultValue).toBe('1.1');

  serverVariable.deleteAllowedValues('1.1');
  expect(serverVariable.defaultValue).toBe('');
});

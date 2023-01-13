import { createJSONAPISchemaRegistry } from './SchemaRegistry';

import type { JSONAPISchemaRegistry } from './types';

let registry: JSONAPISchemaRegistry;

beforeEach(() => {
  registry = createJSONAPISchemaRegistry();
});

test('empty registry', () => {
  expect(registry.getDocumentIds()).toStrictEqual([]);
  expect(registry.getResourceTypes()).toStrictEqual([]);
});

describe('resources', () => {
  test('empty resource', () => {
    const employee = registry.addResourceSchema('employees');

    expect(employee.idSchema.title).toBe('EmployeeResourceID');
    expect(employee.idSchema.type).toBe('object');
    expect(employee.idSchema.getPropertyDeep('type')).toHaveProperty(['enum', '0'], 'employees');
    expect(employee.schema).toBeNull();
    expect(employee.hasAttributes()).toBeFalsy();
    expect(employee.hasRelationships()).toBeFalsy();

    expect(registry.getResourceTypes()).toStrictEqual(['employees']);
    expect(new Set<string>(registry.openapi.components.schemas.keys())).toStrictEqual(
      new Set<string>(['EmployeeResourceID']),
    );
  });

  test('addAttributes()', () => {
    const employee = registry.addResourceSchema('employees');
    employee.addAttributes({
      name: 'string',
      age: 'number',
      gender: { type: 'string', enum: ['male', 'female', 'other'], nullable: true },
    });

    expect(employee.getAttributeNames()).toStrictEqual(['name', 'age', 'gender']);

    const { schema } = employee;
    expect(schema?.getPropertyDeep('attributes')?.getPropertyDeep('name')).toHaveProperty(
      'type',
      'string',
    );
  });
});

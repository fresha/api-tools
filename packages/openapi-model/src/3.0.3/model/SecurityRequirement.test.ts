import { OpenAPIFactory } from './OpenAPI';
import { SecurityRequirementModel } from './types';

let requirement: SecurityRequirementModel;

beforeEach(() => {
  requirement = OpenAPIFactory.create().addSecurityRequirement();
});

test('querying', () => {
  requirement.addSchema('s1', 'a');
  requirement.addSchema('s2', 'b', 'c');

  expect(requirement.schemaCount).toBe(2);
  expect([...requirement.schemaNames()]).toStrictEqual(['s1', 's2']);
  expect(requirement.hasSchema('s1')).toBe(true);
  expect(requirement.hasSchema('s3')).toBe(false);

  expect([...requirement.getScopes('s2')]).toStrictEqual(['b', 'c']);
  expect(() => requirement.getScopes('s3')).toThrow();
});

test('managing schemas', () => {
  requirement.addSchema('s1');
  requirement.addSchema('s2');
  requirement.addSchema('s3');

  expect(requirement.schemaCount).toBe(3);

  requirement.deleteSchema('s2');

  expect([...requirement.schemaNames()]).toStrictEqual(['s1', 's3']);

  requirement.clearSchemas();

  expect(requirement.schemaCount).toBe(0);
});

test('managing scopes', () => {
  requirement.addSchema('s1');
  requirement.addSchema('s2', 'a', 'b');

  expect([...requirement.getScopes('s2')]).toStrictEqual(['a', 'b']);

  requirement.addScopes('s1', 'c', 'd');
  expect([...requirement.getScopes('s2')]).toStrictEqual(['a', 'b']);
  expect([...requirement.getScopes('s1')]).toStrictEqual(['c', 'd']);

  requirement.deleteScopes('s2', 'a');
  expect([...requirement.getScopes('s2')]).toStrictEqual(['b']);

  requirement.clearScopes('s1');
  expect([...requirement.getScopes('s1')]).toStrictEqual([]);

  expect(() => requirement.addScopes('non-existing', 'a')).toThrow();
  expect(() => requirement.deleteScopes('non-existing', 'b')).toThrow();
  expect(() => requirement.clearScopes('non-existing')).toThrow();
});

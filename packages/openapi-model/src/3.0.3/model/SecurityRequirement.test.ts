import { OpenAPIFactory } from './OpenAPI';

test('getScopes + getScopesOrThrow', () => {
  const requirement = OpenAPIFactory.create().addSecurityRequirement();
  requirement.addSchema('s1', 'a');
  requirement.addSchema('s2', 'b');

  expect(requirement.getScopes('s1')).not.toBeUndefined();
  expect(() => requirement.getScopes('s3')).toThrow();
});

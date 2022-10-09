import { OpenAPIFactory } from './OpenAPI';

test('getScopes + getScopesOrThrow', () => {
  const requirement = OpenAPIFactory.create().addSecurityRequirement();
  requirement.addScopes('s1', 'a');
  requirement.addScopes('s2', 'b');

  expect(requirement.getScopes('s1')).not.toBeUndefined();
  expect(requirement.getScopes('s3')).toBeUndefined();
  expect(requirement.getScopesOrThrow('s2')).not.toBeUndefined();
  expect(() => requirement.getScopesOrThrow('s3')).toThrow();
});

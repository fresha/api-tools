import { OpenAPIFactory } from '../OpenAPI';

import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuth2SecuritySchemaModel } from '../types';

class TestFlow extends OAuthFlowBase {}

let flow = {} as OAuthFlowBase;

beforeEach(() => {
  flow = new TestFlow(
    (
      OpenAPIFactory.create().components.setSecuritySchema(
        'test',
        'oauth2',
      ) as OAuth2SecuritySchemaModel
    ).flows,
    'authorizationCode',
  );
});

test('scopes collection', () => {
  expect(flow.scopes.size).toBe(0);

  flow.setScope('x', '*');
  flow.setScope('y', 'email');

  expect(Array.from(flow.scopes.keys())).toStrictEqual(['x', 'y']);

  expect(flow.getScope('y')).toBe('email');
  expect(flow.getScope('z')).toBeUndefined();
  expect(flow.getScopeOrThrow('x')).toBe('*');
  expect(() => flow.getScopeOrThrow('t')).toThrow();

  flow.deleteScope('y');

  expect(flow.scopes.size).toBe(1);

  flow.clearScopes();

  expect(flow.scopes.size).toBe(0);
});

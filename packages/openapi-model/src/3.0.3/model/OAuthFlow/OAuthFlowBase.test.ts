import { OpenAPIFactory } from '../OpenAPI';

import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuth2SecuritySchemaModel } from '../types';

let flow: OAuthFlowBase;

beforeEach(() => {
  class TestFlow extends OAuthFlowBase {
    // eslint-disable-next-line class-methods-use-this
    get type(): 'authorizationCode' {
      return 'authorizationCode';
    }
  }

  flow = new TestFlow(
    (
      OpenAPIFactory.create().components.setSecuritySchema(
        'test',
        'oauth2',
      ) as OAuth2SecuritySchemaModel
    ).flows,
  );
});

test('scopes collection', () => {
  expect(flow.scopeCount).toBe(0);

  flow.addScope('x', '*');
  flow.addScope('y', 'email');

  expect(Array.from(flow.scopeNames())).toStrictEqual(['x', 'y']);

  expect(flow.getScopeDescription('y')).toBe('email');
  expect(() => flow.getScopeDescription('z')).toThrow();

  flow.deleteScope('y');

  expect(flow.scopeCount).toBe(1);

  flow.clearScopes();

  expect(flow.scopeCount).toBe(0);
});

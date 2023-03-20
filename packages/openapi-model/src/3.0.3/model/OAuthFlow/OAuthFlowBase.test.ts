import { OpenAPIFactory } from '../OpenAPI';

import { OAuthFlowBase } from './OAuthFlowBase';

import type { OAuthFlowModelParent } from '../types';

let flow: OAuthFlowBase<'authorizationCode'>;

beforeEach(() => {
  class TestFlow extends OAuthFlowBase<'authorizationCode'> {
    constructor(parent: OAuthFlowModelParent) {
      super(parent, 'authorizationCode');
    }
  }

  flow = new TestFlow(OpenAPIFactory.create().components.setSecuritySchema('test', 'oauth2').flows);
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

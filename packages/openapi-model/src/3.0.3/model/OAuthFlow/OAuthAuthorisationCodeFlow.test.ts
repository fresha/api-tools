import { OpenAPIFactory } from '../OpenAPI';

import { OAuthAuthorisationCodeFlow } from './OAuthAuthorisationCodeFlow';

import type { OAuthFlowModelParent } from '../types';

let parent: OAuthFlowModelParent;

beforeEach(() => {
  parent = OpenAPIFactory.create().components.setSecuritySchema('parent', 'oauth2').flows;
});

test('validates attributes', () => {
  expect(() => new OAuthAuthorisationCodeFlow(parent, 'wrong-url', 'wrong-url')).toThrow();

  const flow = new OAuthAuthorisationCodeFlow(
    parent,
    'https://www.example.com',
    'https://www.example.com',
  );

  expect(() => {
    flow.authorizationUrl = '';
  }).toThrow();
  expect(() => {
    flow.authorizationUrl = '/wrong#url';
  }).toThrow();
  flow.authorizationUrl = 'https://auth.example.com#x';
  expect(flow.authorizationUrl).toBe('https://auth.example.com#x');

  expect(() => {
    flow.tokenUrl = '';
  }).toThrow();
  expect(() => {
    flow.tokenUrl = 'https://';
  }).toThrow();
  flow.tokenUrl = 'https://auth.example.com/tokens';
  expect(flow.tokenUrl).toBe('https://auth.example.com/tokens');
});

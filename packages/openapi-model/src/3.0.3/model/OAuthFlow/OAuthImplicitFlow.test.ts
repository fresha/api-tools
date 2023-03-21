import { OpenAPIFactory } from "../OpenAPI";
import type { OAuthFlowModelParent } from "../types";
import { OAuthImplicitFlow } from "./OAuthImplicitFlow";

let parent: OAuthFlowModelParent;

beforeEach(() => {
  parent = OpenAPIFactory.create().components.setSecuritySchema('parent', 'oauth2').flows;
});

test('validates attributes', () => {
  expect(() => new OAuthImplicitFlow(parent, 'wrong-url')).toThrow();

  const flow = new OAuthImplicitFlow(parent, 'https://www.example.com');

  expect(() => { flow.authorizationUrl = ''; }).toThrow();
  expect(() => { flow.authorizationUrl = '/wrong#url'; }).toThrow();
  flow.authorizationUrl = 'https://auth.example.com#x';
  expect(flow.authorizationUrl).toBe('https://auth.example.com#x');
});

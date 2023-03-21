import { OpenAPIFactory } from "../OpenAPI";
import type { OAuthFlowModelParent } from "../types";
import { OAuthClientCredentialsFlow } from "./OAuthClientCredentialsFlow";

let parent: OAuthFlowModelParent;

beforeEach(() => {
  parent = OpenAPIFactory.create().components.setSecuritySchema('parent', 'oauth2').flows;
});

test('validates attributes', () => {
  expect(() => new OAuthClientCredentialsFlow(parent, 'wrong-url')).toThrow();

  const flow = new OAuthClientCredentialsFlow(parent, 'https://www.example.com');

  expect(() => { flow.tokenUrl = ''; }).toThrow();
  expect(() => { flow.tokenUrl = 'https://'; }).toThrow();
  flow.tokenUrl = 'https://auth.example.com/tokens';
  expect(flow.tokenUrl).toBe('https://auth.example.com/tokens');
});

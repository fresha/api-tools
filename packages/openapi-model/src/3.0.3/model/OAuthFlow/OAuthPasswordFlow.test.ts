import { OpenAPIFactory } from "../OpenAPI";
import type { OAuthFlowModelParent } from "../types";
import { OAuthPasswordFlow } from "./OAuthPasswordFlow";

let parent: OAuthFlowModelParent;

beforeEach(() => {
  parent = OpenAPIFactory.create().components.setSecuritySchema('parent', 'oauth2').flows;
});

test('validates attributes', () => {
  expect(() => new OAuthPasswordFlow(parent, 'wrong-url')).toThrow();

  const flow = new OAuthPasswordFlow(parent, 'https://www.example.com');

  expect(() => { flow.tokenUrl = ''; }).toThrow();
  expect(() => { flow.tokenUrl = 'https://'; }).toThrow();
  flow.tokenUrl = 'https://auth.example.com/tokens';
  expect(flow.tokenUrl).toBe('https://auth.example.com/tokens');
});

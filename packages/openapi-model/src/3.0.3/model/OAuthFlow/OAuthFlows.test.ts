import { OpenAPIFactory } from "../OpenAPI";
import type { OAuthFlowsModel } from "../types";

let flows: OAuthFlowsModel;

beforeEach(() => {
  flows = OpenAPIFactory.create().components.setSecuritySchema('oauthTest', 'oauth2').flows;
});

const TEST_URL = 'http://www.example.com';
const ANOTHER_TEST_URL = 'http://another.example.com';

test('authorizationCode', () => {
  expect(flows.authorizationCode).toBeNull();

  expect(() => flows.setAuthorizationCode('', '')).toThrow();

  flows.setAuthorizationCode(TEST_URL, ANOTHER_TEST_URL);
  expect(flows.authorizationCode?.authorizationUrl).toBe(TEST_URL);
  expect(flows.authorizationCode?.tokenUrl).toBe(ANOTHER_TEST_URL);

  expect(() => flows.setAuthorizationCode(ANOTHER_TEST_URL, TEST_URL)).toThrow();

  flows.deleteAuthorizationCode();
  expect(flows.authorizationCode).toBeNull();
});

test('clientCredentials', () => {
  expect(flows.clientCredentials).toBeNull();

  expect(() => flows.setClientCredentials('')).toThrow();

  flows.setClientCredentials(TEST_URL);
  expect(flows.clientCredentials?.tokenUrl).toBe(TEST_URL);

  expect(() => flows.setClientCredentials(ANOTHER_TEST_URL)).toThrow();

  flows.deleteClientCredentials();
  expect(flows.clientCredentials).toBeNull();
});

test('implicit', () => {
  expect(flows.implicit).toBeNull();

  expect(() => flows.setImplicit('')).toThrow();

  flows.setImplicit(TEST_URL);
  expect(flows.implicit?.authorizationUrl).toBe(TEST_URL);

  expect(() => flows.setImplicit(ANOTHER_TEST_URL)).toThrow();

  flows.deleteImplicit();
  expect(flows.implicit).toBeNull();
});

test('password', () => {
  expect(flows.password).toBeNull();

  expect(() => flows.setPassword('')).toThrow();

  flows.setPassword(TEST_URL);
  expect(flows.password?.tokenUrl).toBe(TEST_URL);

  expect(() => flows.setPassword(ANOTHER_TEST_URL)).toThrow();

  flows.deletePassword();
  expect(flows.password).toBeNull();
});

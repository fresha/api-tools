import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './serverUrls';

import type { RuleOptions } from '../types';

const severity = 'warning';
const options: RuleOptions = { severity, autoFix: false };

let openapi: OpenAPIModel;
let result: LinterResult;

beforeEach(() => {
  openapi = OpenAPIFactory.create('RuleTest1', '0.0.1');
  result = new LinterResult(-1);
});

test('rule disabled on specific server', () => {
  openapi.addServer('https://api1.example.com/');
  openapi.addServer('https://api2.example.com/').setExtension('fresha-lint-disable', [rule.id]);

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: "Server URL 'https://api1.example.com/' must not have trailing slash",
      pointer: '#/servers/0/url',
      ruleId: 'no-server-url-trailing-slash',
      severity,
    },
  ]);
});

test('rule disabled globally', () => {
  openapi.addServer('https://example.com/');
  openapi.addServer('https://api2.example.com');
  openapi.setExtension('fresha-lint-disable', [rule.id]);

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

test('', () => {
  openapi.addServer('https://api1.example.com');
  openapi.addServer('https://api2.example.com/');

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: "Server URL 'https://api2.example.com/' must not have trailing slash",
      pointer: '#/servers/1/url',
      ruleId: 'no-server-url-trailing-slash',
      severity,
    },
  ]);
});

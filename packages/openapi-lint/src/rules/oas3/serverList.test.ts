import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './serverList';

import type { RuleOptions } from '../types';

const severity = 'warning';
const options: RuleOptions = { severity, autoFix: false };

let openapi: OpenAPIModel;
let result: LinterResult;

beforeEach(() => {
  openapi = OpenAPIFactory.create('RuleTest1', '0.0.1');
  result = new LinterResult(-1);
});

test('rule disabled globally', () => {
  openapi.setExtension('fresha-lint-disable', [rule.id]);

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

test('rule enabled', () => {
  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: 'Server list must not be empty',
      pointer: '#/servers',
      ruleId: 'server-list',
      severity,
    },
  ]);
});

test('server list is not empty', () => {
  openapi.addServer('https://api.example.com/v1');

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

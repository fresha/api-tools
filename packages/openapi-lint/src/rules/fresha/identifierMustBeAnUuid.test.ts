import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './identifierMustBeAnUuid';

import type { RuleOptions } from '../types';

const severity = 'warning';
const options: RuleOptions = { severity, autoFix: false };

let openapi: OpenAPIModel;
let result: LinterResult;

beforeEach(() => {
  openapi = OpenAPIFactory.create('RuleTest', '0.0.1');
  result = new LinterResult(-1);
});

describe('rule is disabled', () => {
  test('on root', () => {
    openapi.setExtension('fresha-lint-disable', [rule.id]);

    rule.run(openapi, result, options);

    expect(Array.from(result.issues())).toHaveLength(0);
  });

  test('on info', () => {
    openapi.info.setExtension('fresha-lint-disable', [rule.id]);

    rule.run(openapi, result, options);

    expect(Array.from(result.issues())).toHaveLength(0);
  });
});

test('missing value', () => {
  const changed = rule.run(openapi, result, options);

  expect(changed).toBe(false);
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: 'Schema ID is missing or is not an UUID',
      pointer: '#/info/x-id',
      ruleId: rule.id,
      severity,
    },
  ]);
});

test('valid value', () => {
  openapi.info.setExtension('id', 'b4533de6-89b0-40ba-853f-570214086624');

  const changed = rule.run(openapi, result, options);

  expect(changed).toBe(false);
  expect(Array.from(result.issues())).toHaveLength(0);
});

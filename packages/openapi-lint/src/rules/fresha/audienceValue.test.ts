import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './audienceValue';

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

test('missing x-audience', () => {
  const changed = rule.run(openapi, result, options);

  expect(changed).toBe(false);
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: "The 'x-audience' property is missing or has an illegal value: undefined",
      pointer: '#/info/x-audience',
      ruleId: rule.id,
      severity,
    },
  ]);
});

test('valid x-audience', () => {
  openapi.info.setExtension('audience', 'internal-team');

  const changed = rule.run(openapi, result, options);

  expect(changed).toBe(false);
  expect(Array.from(result.issues())).toHaveLength(0);
});

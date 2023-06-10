import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './contactProperties';

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

  test('on contact', () => {
    openapi.info.contact.setExtension('fresha-lint-disable', [rule.id]);

    rule.run(openapi, result, options);

    expect(Array.from(result.issues())).toHaveLength(0);
  });
});

test('missing values', () => {
  const changed = rule.run(openapi, result, options);

  expect(changed).toBe(false);
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: 'Contact name must be a valid team name',
      pointer: '#/info/contact/name',
      ruleId: rule.id,
      severity,
    },
    {
      file: 'unknown',
      line: -1,
      message: 'Contact URL must point to GitHub team page',
      pointer: '#/info/contact/url',
      ruleId: rule.id,
      severity,
    },
  ]);
});

test('valid contact', () => {
  openapi.info.contact.name = 'team-scalpel';
  openapi.info.contact.url = 'https://github.com/orgs/surgeventures/teams/team-scalpel';

  const changed = rule.run(openapi, result, options);

  expect(changed).toBe(false);
  expect(Array.from(result.issues())).toHaveLength(0);
});

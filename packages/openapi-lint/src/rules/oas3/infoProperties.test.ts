import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './infoProperties';

import type { RuleOptions } from '../types';

const severity = 'warning';
const options: RuleOptions = { severity, autoFix: false };

let openapi: OpenAPIModel;
let result: LinterResult;

beforeEach(() => {
  openapi = OpenAPIFactory.create('RuleTest1', '0.0.1');
  result = new LinterResult(-1);
});

test('disabled rule', () => {
  openapi.info.title = '';
  openapi.info.description = '';
  openapi.setExtension('fresha-lint-disable', [rule.id]);

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

test('missing info properties', () => {
  openapi.info.title = '';
  openapi.info.description = '';

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: 'Schema title must not be empty',
      pointer: '#/info/title',
      ruleId: rule.id,
      severity,
    },
    {
      file: 'unknown',
      line: -1,
      message: 'Schema description must not be empty',
      pointer: '#/info/description',
      ruleId: rule.id,
      severity,
    },
  ]);
});

test('missing info properties', () => {
  openapi.info.title = 'Title';
  openapi.info.description = 'Longer description';

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

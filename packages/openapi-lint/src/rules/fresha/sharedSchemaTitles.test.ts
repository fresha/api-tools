import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './sharedSchemaTitles';

import type { RuleOptions } from '../types';

const severity = 'warning';
const options: RuleOptions = { severity, autoFix: false };

let openapi: OpenAPIModel;
let result: LinterResult;

beforeEach(() => {
  openapi = OpenAPIFactory.create('RuleTest1', '0.0.1');
  result = new LinterResult(-1);
});

test('rule is disabled', () => {
  openapi.components.setSchema('test2').title = 'Test2';
  openapi.components.setSchema('test1').title = 'Test1';
  openapi.setExtension('fresha-lint-disable', [rule.id]);

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

test('empty titles', () => {
  openapi.components.setSchema('test1').title = null;
  openapi.components.setSchema('Test3').title = 'Test3';
  openapi.components.setSchema('test2').title = 'DifferentTitle';

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: `Schema title for key 'test1' must not be empty`,
      pointer: '#/components/schemas/test1',
      ruleId: rule.id,
      severity,
    },
    {
      file: 'unknown',
      line: -1,
      message: 'Shared schema title (DifferentTitle) is different from key (test2)',
      pointer: '#/components/schemas/test2',
      ruleId: rule.id,
      severity,
    },
  ]);
});

test('auto fix', () => {
  openapi.components.setSchema('test1').title = null;
  openapi.components.setSchema('Test3').title = 'Test3';
  openapi.components.setSchema('test2').title = '';

  const changed = rule.run(openapi, result, { severity, autoFix: true });

  expect(changed).toBeTruthy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

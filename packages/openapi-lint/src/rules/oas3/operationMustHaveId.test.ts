import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './operationMustHaveId';

import type { RuleOptions } from '../types';

const severity = 'warning';
const options: RuleOptions = { severity, autoFix: false };

let openapi: OpenAPIModel;
let result: LinterResult;

beforeEach(() => {
  openapi = OpenAPIFactory.create('RuleTest1', '0.0.1');
  result = new LinterResult(-1);
});

test('rule is disabled on root', () => {
  openapi.setPathItem('/').addOperation('get');
  openapi.setPathItem('/{id}').addOperation('post');
  openapi.setExtension('fresha-lint-disable', [rule.id]);

  rule.run(openapi, result, options);

  expect(Array.from(result.issues())).toHaveLength(0);
});

test('rule is disabled on operation', () => {
  openapi.setPathItem('/').addOperation('get').setExtension('fresha-lint-disable', [rule.id]);
  openapi.setPathItem('/{id}').addOperation('post');

  rule.run(openapi, result, options);

  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: "Operation POST '/{id}' has empty ID",
      pointer: '#/paths/{id}/post',
      ruleId: 'operation-id-is-unique',
      severity,
    },
  ]);
});

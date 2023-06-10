import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './parameterDescription';

import type { RuleOptions } from '../types';

const severity = 'error';
const options: RuleOptions = { severity, autoFix: false };

let openapi: OpenAPIModel;
let result: LinterResult;

beforeEach(() => {
  openapi = OpenAPIFactory.create('RuleTest1', '0.0.1');
  result = new LinterResult(-1);
});

test('rule disabled globally', () => {
  openapi.setPathItem('/test/{id}').addParameter('id', 'path');
  openapi.setPathItem('/test2/{id}').addOperation('get').addParameter('id', 'path');
  openapi.setExtension('fresha-lint-disable', [rule.id]);

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

test('rule disable on path item', () => {
  const pathItem1 = openapi.setPathItem('/test/{id}');
  pathItem1.addParameter('id', 'path');
  pathItem1.addOperation('get').addParameter('id', 'path');
  pathItem1.setExtension('fresha-lint-disable', [rule.id]);

  openapi.setPathItem('/test2/{id}').addParameter('id', 'path');

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();

  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: 'Parameter id of GET /test/{id} operation does not have a description',
      pointer: '#/paths/test/{id}/get/parameters/0',
      ruleId: 'parameter-description',
      severity,
    },
    {
      file: 'unknown',
      line: -1,
      message: 'Parameter id of the /test2/{id} item does not have a description',
      pointer: '#/paths/test2/{id}/parameters/0',
      ruleId: 'parameter-description',
      severity,
    },
  ]);
});

test('rule disabled for specific operation', () => {
  const pathItem1 = openapi.setPathItem('/test/{id}');
  pathItem1
    .addOperation('get')
    .addParameter('id', 'path')
    .setExtension('fresha-lint-disable', [rule.id]);
  pathItem1.addParameter('id', 'path');

  openapi.setPathItem('/test2/{id}').addParameter('id', 'path');

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: 'Parameter id of the /test/{id} item does not have a description',
      pointer: '#/paths/test/{id}/parameters/0',
      ruleId: 'parameter-description',
      severity,
    },
    {
      file: 'unknown',
      line: -1,
      message: 'Parameter id of GET /test/{id} operation does not have a description',
      pointer: '#/paths/test/{id}/get/parameters/0',
      ruleId: 'parameter-description',
      severity,
    },
    {
      file: 'unknown',
      line: -1,
      message: 'Parameter id of the /test2/{id} item does not have a description',
      pointer: '#/paths/test2/{id}/parameters/0',
      ruleId: 'parameter-description',
      severity,
    },
  ]);
});

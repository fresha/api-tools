import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './jsonApiContentType';

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
  openapi
    .setPathItem('/test')
    .addOperation('post')
    .setRequestBody()
    .setMediaType('application/json');
  openapi.setExtension('fresha-lint-disable', [rule.id]);

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

test('missing application/vnd.api+json media type', () => {
  const operation = openapi.setPathItem('/test').addOperation('post');
  operation.setRequestBody().setMediaType('application/json');
  operation.responses.setDefaultResponse('OK').setMediaType('application/json');
  operation.responses.setResponse('200', 'OK').setMediaType('application/json');

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: "Operation POST '/test' does not define 'application/vnd.api+json' request body",
      pointer: '#/paths/test/post/requestBody',
      ruleId: 'json-api-content-type',
      severity,
    },
    {
      file: 'unknown',
      line: -1,
      message: "Operation POST '/test' does not define 'application/vnd.api+json' default response",
      pointer: '#/paths/test/post/responses/default',
      ruleId: 'json-api-content-type',
      severity,
    },
    {
      file: 'unknown',
      line: -1,
      message:
        "Operation POST '/test' does not define 'application/vnd.api+json' response for 200 code",
      pointer: '#/paths/test/post/responses/200',
      ruleId: 'json-api-content-type',
      severity,
    },
  ]);
});

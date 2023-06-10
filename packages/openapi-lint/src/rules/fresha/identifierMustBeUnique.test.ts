import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './identifierMustBeUnique';

import type { RuleOptions } from '../types';

const severity = 'warning';
const options: RuleOptions = { severity, autoFix: false };

let openapi: OpenAPIModel[];
let result: LinterResult;

beforeEach(() => {
  openapi = [
    OpenAPIFactory.create('RuleTest1', '0.0.1'),
    OpenAPIFactory.create('RuleTest2', '0.0.1'),
  ];
  result = new LinterResult(-1);
  rule.reset();
});

describe('rule is disabled', () => {
  test('on root', () => {
    openapi.forEach(api => api.setExtension('fresha-lint-disable', [rule.id]));

    openapi.forEach(api => rule.run(api, result, options));

    expect(Array.from(result.issues())).toHaveLength(0);
  });

  test('on info', () => {
    openapi.forEach(api => api.info.setExtension('fresha-lint-disable', [rule.id]));

    openapi.forEach(api => rule.run(api, result, options));

    expect(Array.from(result.issues())).toHaveLength(0);
  });
});

test('nullish IDs do not count', () => {
  openapi.forEach(api => api.info.setExtension('id', null));

  openapi.forEach(api => rule.run(api, result, options));

  expect(Array.from(result.issues())).toHaveLength(0);
});

test('duplicate IDs', () => {
  const schemaId = 'b4533de6-89b0-40ba-853f-570214086624';
  openapi.forEach(api => api.info.setExtension('id', schemaId));

  openapi.forEach(api => rule.run(api, result, options));

  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: `Duplicate schema ID: ${schemaId}`,
      pointer: '#/info/x-id',
      ruleId: rule.id,
      severity,
    },
  ]);
});

test('unique IDs', () => {
  openapi[0].info.setExtension('id', 'b4533de6-89b0-40ba-853f-570214086624');
  openapi[1].info.setExtension('id', '307b032c-c637-4834-8a20-3dc352cd8efa');

  openapi.forEach(api => rule.run(api, result, options));

  expect(Array.from(result.issues())).toHaveLength(0);
});

import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './sortSharedSchema';

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
  openapi.setExtension('fresha-lint-disable', [rule.id]);

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

test('unsorted items', () => {
  openapi.components.setSchema('schema2');
  openapi.components.setSchema('schema1');
  openapi.components.setSchema('Another');

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toStrictEqual([
    {
      ruleId: rule.id,
      severity,
      file: 'unknown',
      line: -1,
      pointer: '#/components/schemas',
      message: 'Shared schemas must be sorted according to their keys',
    },
  ]);
});

test('autofixing', () => {
  openapi.components.setSchema('schema2');
  openapi.components.setSchema('schema1');
  openapi.components.setSchema('Another');

  const changed = rule.run(openapi, result, { severity, autoFix: true });

  expect(changed).toBeTruthy();
  expect(Array.from(result.issues())).toHaveLength(0);
  expect(Array.from(openapi.components.schemaKeys())).toStrictEqual([
    'Another',
    'schema1',
    'schema2',
  ]);
});

import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './duplicateTags';

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
  openapi.addTag('tag1');
  openapi.addTag('tag2').name = 'tag1';
  openapi.setExtension('fresha-lint-disable', [rule.id]);

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

test('with duplicatess', () => {
  openapi.addTag('tag1');
  openapi.addTag('tag2').name = 'tag1';

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: "Duplicate tag 'tag1'",
      pointer: '#/tags/tag1',
      ruleId: 'duplicate-tags',
      severity,
    },
  ]);
});

test('no duplicates', () => {
  openapi.addTag('tag1');
  openapi.addTag('tag2');

  const changed = rule.run(openapi, result, options);

  expect(changed).toBeFalsy();
  expect(Array.from(result.issues())).toHaveLength(0);
});

test('autofix', () => {
  const tag1 = openapi.addTag('tag1');
  tag1.description = 'description1';

  openapi.addTag('tag3');

  const tag2 = openapi.addTag('tag2');
  tag2.name = 'tag1';
  tag2.description = 'description2';

  const changed = rule.run(openapi, result, { severity, autoFix: true });

  expect(changed).toBeTruthy();
  expect(Array.from(result.issues())).toHaveLength(0);

  const [tag, ...rest] = Array.from(openapi.tags());
  expect(tag.name).toBe('tag1');
  expect(tag.description).toBe('description1');
  expect(rest).toHaveLength(1);
});

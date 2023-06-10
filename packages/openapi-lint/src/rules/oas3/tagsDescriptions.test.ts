import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

import { LinterResult } from '../../linter/LinterResult';

import * as rule from './tagsDescriptions';

import type { RuleOptions } from '../types';

const severity = 'warning';
const options: RuleOptions = { severity, autoFix: false };

let openapi: OpenAPIModel;
let result: LinterResult;

beforeEach(() => {
  openapi = OpenAPIFactory.create('RuleTest1', '0.0.1');
  result = new LinterResult(-1);
});

test('rule disabled globally', () => {
  openapi.addTag('tag1');
  openapi.setExtension('fresha-lint-disable', [rule.id]);

  const changed = rule.run(openapi, result, options);

  expect(changed).toBe(false);
  expect(result.issues).toHaveLength(0);
});

test('rule disables on specific tag', () => {
  openapi.addTag('tag1').setExtension('fresha-lint-disable', [rule.id]);
  openapi.addTag('tag2').description = 'tag2 description';

  const changed = rule.run(openapi, result, options);

  expect(changed).toBe(false);
  expect(Array.from(result.issues())).toStrictEqual([
    {
      file: 'unknown',
      line: -1,
      message: "Tag 'tag1' does not have a description",
      pointer: '#/tags/0',
      ruleId: 'tags-descriptions',
      severity,
    },
  ]);
});

test('all tags have descriptions', () => {
  openapi.addTag('tag1').description = 'tag1 description';
  openapi.addTag('tag2').description = 'tag2 description';

  const changed = rule.run(openapi, result, options);

  expect(changed).toBe(false);
  expect(result.issues).toHaveLength(0);
});

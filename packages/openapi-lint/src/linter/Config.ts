import assert from 'assert';
import console from 'console';
import fs from 'fs';

import yaml from 'yaml';

import { rulesets } from '../rules';
import { RuleModule, RuleOptions } from '../rules/types';

import type { Rule, LinterConfig } from '../types';
import type { JSONObject, JSONValue } from '@fresha/api-tools-core';

class Config implements LinterConfig {
  readonly #rules: Rule[];

  constructor() {
    this.#rules = [];
  }

  get ruleCount(): number {
    return this.#rules.length;
  }

  rules(): IterableIterator<Rule> {
    return this.#rules.values();
  }

  addRule(rule: Rule): void {
    if (this.#rules.find(r => r.id === rule.id) == null) {
      this.#rules.push(rule);
    }
  }

  print(): void {
    const output: JSONObject = {};
    for (const rule of this.#rules) {
      output[rule.id] = rule.severity;
    }
    console.log(JSON.stringify(output, null, 2));
  }
}

export const loadConfigFromFile = (path: string): Config => {
  const data = yaml.parse(fs.readFileSync(path, 'utf8')) as unknown;

  const config = new Config();

  assert(data != null);
  assert(typeof data === 'object');

  const base = new Set<string>();
  if ('extends' in data && Array.isArray(data.extends)) {
    for (const rulesetName of data.extends) {
      assert(typeof rulesetName === 'string');
      base.add(rulesetName.replace(/^@fresha\/openapi-lint-ruleset-/, ''));
    }
  }

  const ruleMap = new Map<string, RuleModule>();
  for (const ruleset of rulesets) {
    if (base.has(ruleset.id)) {
      for (const rule of ruleset.rules) {
        ruleMap.set(`${ruleset.id}/${rule.id}`, rule);
      }
    }
  }

  const rulesData = (
    'rules' in data && data.rules != null && typeof data.rules === 'object' ? data.rules : {}
  ) as Record<string, JSONValue>;
  for (const [ruleId, ruleModule] of ruleMap.entries()) {
    const ruleOptions: RuleOptions = {
      autoFix: ruleModule.autoFixable,
      severity: 'error',
    };

    if (rulesData[ruleId] !== false) {
      if (rulesData[ruleId] === 'warning') {
        ruleOptions.severity = 'warning';
      }
      config.addRule({
        id: ruleId,
        severity: ruleOptions.severity,
        run: (openapi, result): boolean => {
          return ruleModule.run(openapi, result, ruleOptions);
        },
      });
    }
  }

  return config;
};

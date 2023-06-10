import * as freshaRuleset from './fresha';
import * as jsonApiRuleset from './json-api';
import * as openapiRuleset from './oas3';

import type { RulesetModule } from './types';

export const rulesets: RulesetModule[] = [freshaRuleset, jsonApiRuleset, openapiRuleset];

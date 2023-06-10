import * as jsonApiContentType from './jsonApiContentType';

import type { RuleModule } from '../types';

export const id = 'json-api';

export const rules: RuleModule[] = [jsonApiContentType];

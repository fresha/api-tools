import { preset as freshaPreset } from './fresha';
import { preset as jsonApiPreset } from './json-api';
import { preset as openApiPreset } from './oas3';

import type { Rule } from './types';

export * from './types';

export const preset: Rule[] = [...openApiPreset, ...jsonApiPreset, ...freshaPreset];
